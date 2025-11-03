// backend/src/api/controllers/medicalRecord.controller.js
import createError from 'http-errors';
import { Op } from 'sequelize';
import db from '../models/index.js';

const { MedicalRecord, Product, StockTransaction, Appointment, User, Pet, Service,sequelize } = db;

// Obtener historial médico por ID de la cita
export const getMedicalRecordByAppointmentId = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const medicalRecord = await MedicalRecord.findOne({
      where: { appointmentId },
      include: [{
        model: Product,
        as: 'products',
        through: { attributes: ['quantityUsed'] },
      }],
    });

    if (!medicalRecord) {
      return next(createError(404, 'No se encontró un historial médico para esta cita.'));
    }

    res.status(200).json(medicalRecord);
  } catch (error) {
    console.error("Error al obtener historial médico:", error);
    next(error);
  }
};

// Crear o actualizar un historial médico
export const upsertMedicalRecord = async (req, res, next) => {
  const { appointmentId, diagnosis, treatment, notes, productsUsed } = req.body;
  const userId = req.user.id;

  if (!appointmentId) {
    return next(createError(400, 'El ID de la cita es obligatorio.'));
  }

  const t = await sequelize.transaction();

  try {
    let medicalRecord = await MedicalRecord.findOne({
      where: { appointmentId },
      include: [{
        model: Product,
        as: 'products',
        through: { attributes: ['quantityUsed'] },
      }],
      transaction: t,
      lock: true,
    });

    if (medicalRecord) {
      // Devolver el stock de los productos usados anteriormente
      for (const oldProduct of medicalRecord.products) {
        const productToReturn = await Product.findByPk(oldProduct.id, { transaction: t, lock: true });
        const quantityToReturn = oldProduct.MedicalRecordProduct.quantityUsed;

        productToReturn.quantity += quantityToReturn;
        await productToReturn.save({ transaction: t });

        await StockTransaction.create({
          productId: productToReturn.id,
          userId,
          type: 'Ajuste',
          quantityChange: quantityToReturn,
          reason: `Devolución por edición de historial de cita #${appointmentId}`,
        }, { transaction: t });
      }

      // Actualizar los datos del historial
      medicalRecord.diagnosis = diagnosis;
      medicalRecord.treatment = treatment;
      medicalRecord.notes = notes;
      await medicalRecord.save({ transaction: t });

      // Limpiar las asociaciones previas
      await medicalRecord.setProducts([], { transaction: t });

    } else {
      // Crear un nuevo historial
      medicalRecord = await MedicalRecord.create({
        appointmentId, diagnosis, treatment, notes,
      }, { transaction: t });
    }

    // Consumir nuevo stock
    if (Array.isArray(productsUsed) && productsUsed.length > 0) {
      for (const item of productsUsed) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: true });

        if (!product || product.quantity < item.quantityUsed) {
          await t.rollback();
          return next(createError(400, `Stock insuficiente para: ${product?.name || 'Producto desconocido'}.`));
        }

        product.quantity -= item.quantityUsed;
        await product.save({ transaction: t });

        await StockTransaction.create({
          productId: item.productId,
          userId,
          type: 'Uso en Cita',
          quantityChange: -item.quantityUsed,
          reason: `Cita ID: ${appointmentId}`,
        }, { transaction: t });

        // Asociar producto y cantidad usada al historial
        await medicalRecord.addProduct(product, { through: { quantityUsed: item.quantityUsed }, transaction: t });
      }
    }

    // Actualizar estado de la cita a "Completada"
    const appointment = await Appointment.findByPk(appointmentId, { transaction: t });
    if (appointment) {
      appointment.status = 'Completada';
      await appointment.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: 'Historial médico guardado exitosamente.', medicalRecord });

  } catch (error) {
    await t.rollback();
    console.error("Error al guardar historial médico:", error);
    next(error);
  }
};

// [Todos los autenticados] Obtener el historial médico completo de una mascota
export const getPetMedicalHistory = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { keyword, startDate, endDate } = req.query;
    const requester = req.user;

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return next(createError(404, 'Mascota no encontrada.'));
    }

    // Validación de permisos: El cliente solo puede ver sus propias mascotas.
    if (requester.role === 'Cliente' && pet.ownerId !== requester.id) {
      return next(createError(403, 'No tienes permiso para ver el historial de esta mascota.'));
    }

    // Construcción de la cláusula de búsqueda
    const whereClause = {};
    if (keyword) {
      whereClause[Op.or] = [
        { diagnosis: { [Op.like]: `%${keyword}%` } },
        { treatment: { [Op.like]: `%${keyword}%` } },
        { notes: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const appointmentWhere = { petId };
    if (startDate && endDate) {
      appointmentWhere.dateTime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const records = await MedicalRecord.findAll({
      where: whereClause,
      include: [
        {
          model: Appointment,
          as: 'appointment',
          where: appointmentWhere,
          required: true,
          include: [
            { model: User, as: 'professional', attributes: ['id', 'firstName', 'lastName'] },
            { model: Service, as: 'service', attributes: ['name'] },
          ],
        },
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name'],
          through: { attributes: ['quantityUsed'] },
        },
      ],
      order: [[{ model: Appointment, as: 'appointment' }, 'dateTime', 'DESC']],
    });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};
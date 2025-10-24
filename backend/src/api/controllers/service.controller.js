// backend/src/api/controllers/service.controller.js
import createError from 'http-errors';
import db from '../models/index.js';

const { Service } = db;

// [Admin] Crear un nuevo servicio
export const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, type } = req.body;

    // Validaciones básicas
    if (!name?.trim() || !price || !duration || !type?.trim()) {
      return next(createError(400, 'Nombre, precio, duración y tipo son obligatorios.'));
    }

    // Validación adicional
    if (isNaN(price) || price <= 0) {
      return next(createError(400, 'El precio debe ser un número positivo.'));
    }
    if (isNaN(duration) || duration <= 0) {
      return next(createError(400, 'La duración debe ser un número positivo (en minutos).'));
    }

    // Verificar duplicado
    const existing = await Service.findOne({ where: { name } });
    if (existing) {
      return next(createError(409, 'Ya existe un servicio con ese nombre.'));
    }

    const newService = await Service.create({
      name: name.trim(),
      description: description?.trim() || '',
      price,
      duration,
      type: type.trim(),
    });

    res.status(201).json({
      message: 'Servicio creado exitosamente.',
      service: newService,
    });
  } catch (error) {
    next(error);
  }
};

// [Todos los autenticados] Obtener todos los servicios
export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'price', 'duration', 'type', 'createdAt'],
    });

    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

// [Admin] Actualizar un servicio
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;

    const service = await Service.findByPk(id);
    if (!service) return next(createError(404, 'Servicio no encontrado.'));

    // Validaciones opcionales si se envían los campos
    if (price && (isNaN(price) || price <= 0)) {
      return next(createError(400, 'El precio debe ser un número positivo.'));
    }
    if (duration && (isNaN(duration) || duration <= 0)) {
      return next(createError(400, 'La duración debe ser un número positivo.'));
    }

    // Verificar si el nombre ya existe
    if (name && name !== service.name) {
      const duplicate = await Service.findOne({ where: { name } });
      if (duplicate) {
        return next(createError(409, 'Ya existe otro servicio con ese nombre.'));
      }
    }

    await service.update(req.body);

    res.status(200).json({
      message: 'Servicio actualizado exitosamente.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// [Admin] Eliminar un servicio
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) return next(createError(404, 'Servicio no encontrado.'));

    await service.destroy();

    res.status(200).json({
      message: `El servicio "${service.name}" fue eliminado correctamente.`,
    });
  } catch (error) {
    next(error);
  }
};

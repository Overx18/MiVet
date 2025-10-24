//Lógica para CRUD de citas
// backend/src/api/controllers/appointment.controller.js
import createError from 'http-errors';
import { Op } from 'sequelize';
import db from '../models/index.js';

const Appointment = db.Appointment;
const Service = db.Service;
const User = db.User;
const Pet = db.Pet;

// [Cliente, Recepcionista] Crear una nueva cita
export const createAppointment = async (req, res, next) => {
  try {
    const { petId, serviceId, professionalId, dateTime } = req.body;
    const requester = req.user;

    // 1. Validar datos de entrada
    if (!petId || !serviceId || !professionalId || !dateTime) {
      return next(createError(400, 'Mascota, servicio, profesional y fecha/hora son obligatorios.'));
    }

    // 2. Obtener entidades y validar existencias
    const [pet, service, professional] = await Promise.all([
      Pet.findByPk(petId),
      Service.findByPk(serviceId),
      User.findByPk(professionalId),
    ]);

    if (!pet || !service || !professional) {
      return next(createError(404, 'Mascota, servicio o profesional no encontrado.'));
    }

    // 3. Validar permisos
    if (requester.role === 'Cliente' && pet.ownerId !== requester.id) {
      return next(createError(403, 'No puedes agendar citas para mascotas que no te pertenecen.'));
    }

    // 4. Validar que el rol del profesional coincida con el tipo de servicio
    const roleForService = service.type === 'Médico' ? 'Veterinario' : 'Groomer';
    if (professional.role !== roleForService) {
      return next(createError(400, `Este servicio solo puede ser atendido por un ${roleForService}.`));
    }

    // 5. Validar disponibilidad del profesional (CRÍTICO)
    const appointmentStart = new Date(dateTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + service.duration * 60000); // Añadir duración en ms

    const conflictingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        status: { [Op.ne]: 'Cancelada' }, // No considerar citas canceladas
        dateTime: {
          [Op.lt]: appointmentEnd,
          [Op.gt]: new Date(appointmentStart.getTime() - 1 * 60000), // Margen para evitar solapamientos exactos
        },
      },
    });

    if (conflictingAppointment) {
      return next(createError(409, 'El profesional no está disponible en el horario seleccionado.'));
    }

    // 6. Crear la cita
    const newAppointment = await Appointment.create({
      petId,
      serviceId,
      professionalId,
      dateTime: appointmentStart,
      totalPrice: service.price,
      status: 'Pagada',
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};

// [Todos los autenticados] Obtener profesionales según tipo de servicio
export const getProfessionalsByServiceType = async (req, res, next) => {
  try {
    const { type } = req.query; // 'Médico' o 'Estético'
    if (!type) {
      return next(createError(400, 'El tipo de servicio es requerido.'));
    }

    const role = type === 'Médico' ? 'Veterinario' : 'Groomer';
    const professionals = await User.findAll({
      where: { role, isActive: true },
      attributes: ['id', 'firstName', 'lastName'],
    });

    res.status(200).json(professionals);
  } catch (error) {
    next(error);
  }
};

// [Todos los autenticados] Obtener horarios disponibles para un profesional y servicio
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { professionalId, date, serviceId } = req.query;

    if (!professionalId || !date || !serviceId) {
      return next(createError(400, 'Se requieren el profesional, la fecha y el servicio.'));
    }

    // 1. Obtener duración del servicio
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return next(createError(404, 'Servicio no encontrado.'));
    }
    const appointmentDuration = service.duration; // minutos

    // 2. Definir horario laboral (ej. 9:00 a 18:00)
    const workDayStart = new Date(`${date}T09:00:00`);
    const workDayEnd = new Date(`${date}T18:00:00`);

    // 3. Obtener citas existentes del profesional en ese día
    const existingAppointments = await Appointment.findAll({
      where: {
        professionalId,
        status: { [Op.ne]: 'Cancelada' },
        dateTime: { [Op.between]: [workDayStart, workDayEnd] },
      },
      include: [{ model: Service, as: 'service', attributes: ['duration'] }],
      order: [['dateTime', 'ASC']],
    });

    // 4. Generar slots según la duración del servicio
    const availableSlots = [];
    let currentTime = new Date(workDayStart);

    while (currentTime < workDayEnd) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(slotStart.getTime() + appointmentDuration * 60000);

      // Si el bloque completo se pasa del horario laboral → salir
      if (slotEnd > workDayEnd) break;

      // Verificar si el bloque (slotStart-slotEnd) se solapa con alguna cita existente
      const isOccupied = existingAppointments.some(existing => {
        const existingStart = new Date(existing.dateTime);
        const existingEnd = new Date(
          existingStart.getTime() + (existing.Service?.duration || appointmentDuration) * 60000
        );
        return slotStart < existingEnd && slotEnd > existingStart;
      });

      if (!isOccupied) {
        availableSlots.push(
          slotStart.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
        );
      }

      // En lugar de avanzar 30 min, avanzamos exactamente el tiempo del servicio
      currentTime = new Date(currentTime.getTime() + appointmentDuration * 60000);
    }

    res.status(200).json(availableSlots);
  } catch (error) {
    next(error);
  }
};

// [Todos los autenticados] Obtener citas para el calendario
export const getAppointments = async (req, res, next) => {
  try {
    const { start, end } = req.query; // Fechas en formato ISO
    if (!start || !end) {
      return next(createError(400, 'Se requieren fechas de inicio y fin.'));
    }

    const whereClause = {
      dateTime: { [Op.between]: [new Date(start), new Date(end)] },
      status: { [Op.ne]: 'Cancelada' },
    };

    // Filtrar por rol
    if (['Veterinario', 'Groomer'].includes(req.user.role)) {
      whereClause.professionalId = req.user.id;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: Pet, as: 'pet', attributes: ['id', 'name', 'ownerId'] },
        { model: Service, as: 'service', attributes: ['name', 'duration', 'type'] },
        { model: User, as: 'professional', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    // Si es un cliente, filtrar para que solo vea las citas de sus mascotas
    if (req.user.role === 'Cliente') {
      const clientAppointments = appointments.filter(app => app.pet?.ownerId === req.user.id);
      return res.status(200).json(clientAppointments);
    }

    res.status(200).json(appointments);
    console.log('>>> Fechas recibidas:', req.query);
  } catch (error) {
    next(error);
  }
};

// [Recepcionista, Admin] Reprogramar una cita (drag & drop)
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDateTime } = req.body;

    const appointment = await Appointment.findByPk(id, { include: [Service] });
    if (!appointment) {
      return next(createError(404, 'Cita no encontrada.'));
    }

    // Reutilizar la lógica de validación de disponibilidad
    const appointmentStart = new Date(newDateTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.Service.duration * 60000);

    const conflicting = await Appointment.findOne({
      where: {
        id: { [Op.ne]: id }, // Excluir la cita actual
        professionalId: appointment.professionalId,
        status: { [Op.ne]: 'Cancelada' },
        dateTime: { [Op.lt]: appointmentEnd, [Op.gt]: new Date(appointmentStart.getTime() - 1 * 60000) },
      },
    });

    if (conflicting) {
      return next(createError(409, 'El nuevo horario no está disponible.'));
    }

    appointment.dateTime = appointmentStart;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};
//Lógica para CRUD de citas
// backend/src/api/controllers/appointment.controller.js
import createError from 'http-errors';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { sendEmail } from '../../utils/email.js';

const Appointment = db.Appointment;
const Service = db.Service;
const User = db.User;
const Pet = db.Pet;
const MedicalRecord = db.MedicalRecord;

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
    const { start, end, professionalId, serviceId, petId } = req.query;
    const user = req.user;

    if (!start || !end) {
      return next(createError(400, 'Se requiere un rango de fechas (start, end).'));
    }

    // Inicializar whereClause
    const whereClause = {
      dateTime: { [Op.between]: [new Date(start), new Date(end)] },
      status: { [Op.ne]: 'Cancelada' },
    };

    // Filtros opcionales
    if (professionalId) whereClause.professionalId = professionalId;
    if (serviceId) whereClause.serviceId = serviceId;
    if (petId) whereClause.petId = petId;

    // Lógica de autorización
    if (user.role === 'Cliente') {
      const userPets = await Pet.findAll({ where: { ownerId: user.id }, attributes: ['id'] });
      const petIds = userPets.map(p => p.id);
      whereClause.petId = { [Op.in]: petIds };
    } else if (['Veterinario', 'Groomer'].includes(user.role)) {
      whereClause.professionalId = user.id;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { 
          model: Pet, 
          as: 'pet', 
          attributes: ['id', 'name', 'ownerId', 'speciesId'],
          include: [
            { 
              model: User, 
              as: 'owner', 
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] 
            },
            { 
              model: db.Species, 
              as: 'species', 
              attributes: ['id', 'name'] 
            }
          ]
        },
        { model: Service, as: 'service', attributes: ['name', 'duration', 'type'] },
        { model: User, as: 'professional', attributes: ['id', 'firstName', 'lastName'] },
        {
        model: MedicalRecord,
        as: 'medicalRecord',
        attributes: ['id'], // Optimización: solo traemos el id
        required: false // Es un LEFT JOIN, trae la cita aunque no tenga historial
        }
      ],
      order: [['dateTime', 'ASC']],
    });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// [Recepcionista, Admin, Cliente (con límite de tiempo)] Reprogramar una cita
export const rescheduleAppointment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { newDateTime } = req.body;
      const requester = req.user; // Obtener el usuario autenticado
  
      const appointment = await Appointment.findByPk(id, { 
        include: [
          { model: db.Service, as: 'service' },
          { model: db.Pet, as: 'pet' },
        ]
      });
      
  
      if (!appointment) {
        return next(createError(404, 'Cita no encontrada.'));
      }
  
      // 1. Validar Permisos y Rol
      const isOwner = requester.role === 'Cliente' && appointment.pet.ownerId === requester.id;
      const isAdminOrReceptionist = ['Admin', 'Recepcionista'].includes(requester.role);
  
      if (!isOwner && !isAdminOrReceptionist) {
        return next(createError(403, 'No tienes permiso para reprogramar esta cita.'));
      }
      
      // Solo permitir reprogramar citas 'Pagada'
      if (appointment.status !== 'Pagada') {
          return next(createError(400, `Solo se pueden reprogramar citas con estado 'Programada'.`));
      }
  
  
      // 2. Lógica de Reprogramación < 24 horas (Solo aplica para el cliente, no para Admin/Recepcionista)
      if (isOwner) {
        const hoursUntilAppointment = (new Date(appointment.dateTime) - new Date()) / (1000 * 60 * 60);
        if (hoursUntilAppointment < 24) {
          return next(createError(403, 'No se puede reprogramar la cita, ya que es en menos de 4 horas.'));
        }
      }
  
      // 3. Reutilizar la lógica de validación de disponibilidad
      const appointmentStart = new Date(newDateTime);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.service.duration * 60000);
  
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
  
      // 4. Reprogramar y guardar
      appointment.dateTime = appointmentStart;
      await appointment.save();
  
      res.status(200).json({ 
          message: 'Cita reprogramada exitosamente.',
          appointment 
      });
    } catch (error) {
      next(error);
    }
  };

// [Todos los autenticados] Cancelar una cita
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Pet, as: 'pet', include: [{ model: User, as: 'owner' }] },
        { model: User, as: 'professional' },
        { model: Service, as: 'service' },
      ],
    });

    if (!appointment) {
      return next(createError(404, 'Cita no encontrada.'));
    }

    // 1. Validar permisos
    const isOwner = requester.role === 'Cliente' && appointment.pet.ownerId === requester.id;
    const isProfessional = ['Veterinario', 'Groomer'].includes(requester.role) && appointment.professionalId === requester.id;
    const isAdminOrReceptionist = ['Admin', 'Recepcionista'].includes(requester.role);

    if (!isOwner && !isProfessional && !isAdminOrReceptionist) {
      return next(createError(403, 'No tienes permiso para cancelar esta cita.'));
    }

    // 2. Lógica de cancelación < 24 horas
    const hoursUntilAppointment = (new Date(appointment.dateTime) - new Date()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 24 && !isOwner) {
      // Aquí se podría notificar a los clientes
      return res.status(200).json({
        message: 'No se puede cancelar la cita, ya que es en menos de 4 horas despues del pago.',
        appointment,
      });
    }

    // 3. Cancelación directa
    appointment.status = 'Cancelada';
    await appointment.save();

    // 4. Enviar notificaciones por email
    const clientEmail = appointment.pet.owner.email;
    const professionalEmail = appointment.professional.email;
    const formattedDate = new Date(appointment.dateTime).toLocaleString('es-ES');

    // Email para el cliente
    await sendEmail({
      to: clientEmail,
      subject: `Cita Cancelada: ${appointment.service.name} para ${appointment.pet.name}`,
      text: `Hola ${appointment.pet.owner.firstName},\n\nTe informamos que tu cita para ${appointment.pet.name} el día ${formattedDate} ha sido cancelada.\n\nSaludos,\nEl equipo de MiVet.`,
    });

    // Email para el profesional
    await sendEmail({
      to: professionalEmail,
      subject: `Cita Cancelada: ${appointment.service.name}`,
      text: `Hola ${appointment.professional.firstName},\n\nLa cita para ${appointment.pet.name} el día ${formattedDate} ha sido cancelada.\n\nSaludos.`,
    });

    res.status(200).json({ message: 'Cita cancelada exitosamente.' });

  } catch (error) {
    next(error);
  }
};


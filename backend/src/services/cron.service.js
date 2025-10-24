// backend/src/services/cron.service.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import db from '../api/models/index.js';
import { sendEmail } from '../utils/email.js';

const Appointment = db.Appointment;

const sendAppointmentReminders = async () => {
  console.log('Ejecutando tarea de recordatorios de citas...');

  try {
    // 1. Buscar citas programadas para las próximas 24 horas que no hayan recibido recordatorio
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = await Appointment.findAll({
      where: {
        dateTime: {
          [Op.between]: [now, in24Hours],
        },
        status: 'Programada',
        reminderSent: false,
      },
      include: [
        { model: db.Pet, as: 'pet', include: [{ model: db.User, as: 'owner', attributes: ['email', 'firstName'] }] },
        { model: db.Service, as: 'service' },
        { model: db.User, as: 'professional', attributes: ['firstName', 'lastName'] },
      ],
    });

    if (upcomingAppointments.length === 0) {
      console.log('No hay recordatorios de citas para enviar.');
      return;
    }

    console.log(`Enviando ${upcomingAppointments.length} recordatorio(s)...`);

    // 2. Iterar y enviar cada recordatorio
    for (const app of upcomingAppointments) {
      const owner = app.pet.owner;
      const formattedDate = new Date(app.dateTime).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

      const emailBody = `
        <h1>Recordatorio de Cita - MiVet</h1>
        <p>Hola ${owner.firstName},</p>
        <p>Te recordamos que tienes una cita programada para tu mascota <strong>${app.pet.name}</strong>.</p>
        <ul>
          <li><strong>Servicio:</strong> ${app.service.name}</li>
          <li><strong>Profesional:</strong> ${app.professional.firstName} ${app.professional.lastName}</li>
          <li><strong>Fecha y Hora:</strong> ${formattedDate}</li>
        </ul>
        <p>Si necesitas cancelar o reprogramar, por favor, contacta con nosotros.</p>
        <p>¡Te esperamos!</p>
      `;

      await sendEmail({
        to: owner.email,
        subject: `Recordatorio de tu cita para ${app.pet.name}`,
        html: emailBody,
      });

      // 3. Marcar el recordatorio como enviado
      app.reminderSent = true;
      await app.save();
    }
  } catch (error) {
    console.error('Error en la tarea de recordatorios de citas:', error);
  }
};

/**
 * Inicia el cron job para enviar recordatorios.
 * Se ejecuta cada hora.
 */
export const startReminderJob = () => {
  // '0 * * * *' -> Ejecutar en el minuto 0 de cada hora
  cron.schedule('0 * * * *', sendAppointmentReminders, {
    scheduled: true,
    timezone: "America/Lima",
  });

  console.log('Cron job para recordatorios de citas iniciado. Se ejecutará cada hora.');
};
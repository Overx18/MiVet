// backend/src/api/controllers/payment.controller.js
import createError from 'http-errors';
import Stripe from 'stripe';
import db from '../models/index.js';
import { config } from '../../config/index.js';
import { Op } from 'sequelize';

const stripe = new Stripe(config.stripe.secretKey);
const Appointment = db.Appointment;
const Service = db.Service;
const User = db.User;
const Pet = db.Pet;

// NUEVA FUNCIÓN: Valida la cita y crea el intento de pago
export const createAppointmentAndPaymentIntent = async (req, res, next) => {
  try {
    const { petId, serviceId, professionalId, dateTime } = req.body;

    // 1. Validaciones (similar a la antigua createAppointment)
    if (!petId || !serviceId || !professionalId || !dateTime) {
      return next(createError(400, 'Faltan datos para la cita.'));
    }

    const userId = req.user.id;

    // Valida que el userId exista, si no, es un error de autenticación
    if (!userId) {
      console.error("Error de autenticación: No se pudo encontrar 'userId'. El objeto req.auth es:", req.auth);
      return next(createError(401, 'Usuario no autenticado o ID de usuario no encontrado.'));
  }

    const [service, professional] = await Promise.all([
      Service.findByPk(serviceId),
      User.findByPk(professionalId),
    ]);
    if (!service || !professional) {
      return next(createError(404, 'Servicio o profesional no encontrado.'));
    }

    // 2. Validar disponibilidad del profesional
    const appointmentStart = new Date(dateTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + service.duration * 60000);
    const conflictingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        status: { [Op.ne]: 'Cancelada' },
        dateTime: { [Op.lt]: appointmentEnd, [Op.gt]: new Date(appointmentStart.getTime() - 1 * 60000) },
      },
    });
    if (conflictingAppointment) {
      return next(createError(409, 'El profesional no está disponible en el horario seleccionado.'));
    }

// 3. Crear el PaymentIntent con metadatos
    const amountInCents = Math.round(service.price * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pen',
      metadata: {
        // [SOLUCIÓN - PARTE 2]
        // Añade el userId que obtuviste
        userId, 
        petId,
        serviceId,
        professionalId,
        dateTime: appointmentStart.toISOString(),
        totalPrice: service.price,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

// [2] Webhook de Stripe (confirma pago y crea cita)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = config.stripe.webhookSecret;

  let event;

  // 1. Verificar la firma del webhook
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified.');
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Manejar el evento 'payment_intent.succeeded'
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;
    console.log('✅ Event `payment_intent.succeeded` received:', paymentIntent.id);
    console.log('📦 Metadata received:', metadata);

    try {
      // Diferenciar entre pago de venta y pago de cita
      if (metadata.saleId) {
        await db.Sale.update(
          { status: 'Pagada' },
          { where: { id: metadata.saleId } }
        );
        console.log(`✅ Venta ID: ${metadata.saleId} marcada como pagada.`);
      } else if (metadata.appointmentId || metadata.userId) {
        // Crear cita pagada
        if (
          !metadata.userId ||
          !metadata.petId ||
          !metadata.serviceId ||
          !metadata.professionalId ||
          !metadata.dateTime
        ) {
          throw new Error('Incomplete metadata for creating appointment.');
        }

        const newAppointment = await db.Appointment.create({
          userId: metadata.userId,
          petId: metadata.petId,
          serviceId: metadata.serviceId,
          professionalId: metadata.professionalId,
          dateTime: new Date(metadata.dateTime),
          status: 'Pagada',
          totalPrice: parseFloat(metadata.totalPrice),
          paymentIntentId: paymentIntent.id,
        });

        console.log('✅ Appointment created successfully:', newAppointment.id);
      }
    } catch (dbError) {
      console.error('❌ Database error creating appointment:', dbError);
      return res
        .status(500)
        .json({ error: 'Failed to save appointment to database.' });
    }
  } else {
    console.log(`🔔 Received unhandled event type: ${event.type}`);
  }

  // 3. Responder 200 OK a Stripe
  res.status(200).json({ received: true });
};


export const confirmPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await db.Appointment.findByPk(appointmentId);
    if (!appointment) return next(createError(404, 'Cita no encontrada'));

    appointment.status = 'Pagada';
    await appointment.save();

    res.json({ message: 'Pago confirmado y cita actualizada' });
  } catch (error) {
    next(error);
  }
};
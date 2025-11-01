import { Router } from 'express';
import { createAppointmentAndPaymentIntent } from '../controllers/payment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(protect);

// Crear intento de pago para cita
router.post('/schedule-and-pay', createAppointmentAndPaymentIntent);

export default router;

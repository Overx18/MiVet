import { Router } from 'express';
import { createAppointmentAndPaymentIntent } from '../controllers/payment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/schedule-and-pay', protect, createAppointmentAndPaymentIntent);

export default router;

import { Router } from 'express';
import { createAppointmentAndPaymentIntent } from '../controllers/payment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();
router.use(protect);

// Crear intento de pago para cita
router.post('/schedule-and-pay', authorize('Cliente', 'Recepcionista'), createAppointmentAndPaymentIntent);

export default router;

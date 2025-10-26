// backend/src/api/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import speciesRoutes from './species.routes.js';
import petRoutes from './pet.routes.js';
import serviceRoutes from './service.routes.js'; 
import appointmentRoutes from './appointment.routes.js';
import paymentRoutes from './payment.routes.js';
import productRoutes from './product.routes.js'; 
import salesRoutes from './sales.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/species', speciesRoutes);
router.use('/pets', petRoutes);
router.use('/services', serviceRoutes); 
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes); 
router.use('/sales', salesRoutes);

export default router;
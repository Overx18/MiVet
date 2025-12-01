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
import medicalRecordRoutes from './medicalRecord.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import contactRoutes from './contact.routes.js';
import chatbotRoutes from './chatbot.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/species', speciesRoutes);
router.use('/pets', petRoutes);
router.use('/services', serviceRoutes); 
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes); 
router.use('/sales', salesRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/reports', reportRoutes);
router.use('/contact', contactRoutes);
router.use('/chatbot', chatbotRoutes);

export default router;
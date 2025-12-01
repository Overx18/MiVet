// backend/src/api/routes/dashboard.routes.js
import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// Proteger la ruta - disponible para todos los usuarios autenticados
router.get('/', protect, getDashboardData);

export default router;
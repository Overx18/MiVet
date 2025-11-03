import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// Proteger la ruta del dashboard
router.get('/', protect, getDashboardData);

export default router;
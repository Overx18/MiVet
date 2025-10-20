//Unifica y exporta todas las rutas
// backend/src/api/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
// Importa otras rutas aquí a medida que las crees

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
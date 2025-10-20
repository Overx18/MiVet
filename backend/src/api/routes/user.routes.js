//Rutas para /api/users
// backend/src/api/routes/user.routes.js
import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas aquí están protegidas y requieren autenticación
router.use(protect);

// GET /api/users/profile -> Obtener perfil
// PUT /api/users/profile -> Actualizar perfil
router
  .route('/profile')
  .get(getProfile)
  .put(updateProfile);

export default router;
//Rutas para /api/users
// backend/src/api/routes/user.routes.js
import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers, updateUserRole } from '../controllers/user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { getClients } from '../controllers/sale.controller.js';

const router = Router();

// Todas las rutas aquí están protegidas y requieren autenticación
router.use(protect);

// Rutas para el perfil del usuario autenticado
router.route('/profile').get(getProfile).put(updateProfile);

// --- Rutas solo para Administradores ---
const adminOnly = authorize('Admin');

// GET /api/users -> Listar todos los usuarios
router.get('/', authorize('Admin', 'Recepcionista'), getAllUsers);

// PUT /api/users/:id/role -> Actualizar el rol de un usuario
router.put('/:id/role', adminOnly, updateUserRole);

export default router;
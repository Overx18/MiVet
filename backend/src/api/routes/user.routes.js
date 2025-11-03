//Rutas para /api/users
// backend/src/api/routes/user.routes.js
import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers, updateUserRole, toggleUserStatus } from '../controllers/user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas aquí están protegidas y requieren autenticación
router.use(protect);

// Rutas para el perfil del usuario autenticado
router.route('/profile').get(getProfile).put(updateProfile);

// GET /api/users -> Listar todos los usuarios
router.get('/', authorize('Admin', 'Recepcionista', 'Veterinario'), getAllUsers);

// PUT /api/users/:id/role -> Actualizar el rol de un usuario
router.put('/:id/role', authorize('Admin'), updateUserRole);

// PATCH /api/users/:id/toggle-status -> Activar/Desactivar usuario
router.patch('/:id/toggle-status', authorize('Admin'), toggleUserStatus);


export default router;
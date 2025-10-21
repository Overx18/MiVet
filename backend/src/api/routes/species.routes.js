// backend/src/api/routes/species.routes.js
import { Router } from 'express';
import { createSpecies, getAllSpecies, updateSpecies, deleteSpecies } from '../controllers/species.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// La obtención de especies es para todos los usuarios autenticados (para registrar mascotas)
router.get('/', protect, getAllSpecies);

// La creación, actualización y eliminación es solo para administradores
router.post('/', protect, authorize('Admin'), createSpecies);
router.put('/:id', protect, authorize('Admin'), updateSpecies);
router.delete('/:id', protect, authorize('Admin'), deleteSpecies);

export default router;
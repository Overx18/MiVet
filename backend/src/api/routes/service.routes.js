//Rutas para /api/services
// backend/src/api/routes/service.routes.js
import { Router } from 'express';
import { createService, getAllServices, updateService, deleteService } from '../controllers/service.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger todas las rutas
router.use(protect);

// La lectura de servicios es para todos los usuarios autenticados
router.get('/', getAllServices);

// La creación, actualización y eliminación es solo para administradores
const adminOnly = authorize('Admin');
router.post('/', adminOnly, createService);
router.put('/:id', adminOnly, updateService);
router.delete('/:id', adminOnly, deleteService);

export default router;
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
router.post('/', authorize('Admin'), createService);
router.put('/:id', authorize('Admin'), updateService);
router.delete('/:id', authorize('Admin'), deleteService);

export default router;
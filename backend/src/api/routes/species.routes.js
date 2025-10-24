// backend/src/api/routes/species.routes.js
import { Router } from 'express';
import { createSpecies, getAllSpecies,updateSpecies,deleteSpecies} from '../controllers/species.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(protect);

/**
 * Rutas para la gestión de especies
 * Roles:
 *  - Cliente, Veterinario, Recepcionista: pueden ver la lista
 *  - Admin: puede crear, actualizar y eliminar
 */

//  Obtener todas las especies (para registrar mascotas, etc.)
router.get('/', getAllSpecies);

//  Crear una nueva especie (solo Admin)
router.post('/', authorize('Admin'), createSpecies);

//  Actualizar una especie (solo Admin)
router.put('/:id', authorize('Admin'), updateSpecies);

//  Eliminar una especie (solo Admin)
router.delete('/:id', authorize('Admin'), deleteSpecies);

export default router;

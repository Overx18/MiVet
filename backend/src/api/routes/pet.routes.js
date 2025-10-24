//Rutas para /api/pets
// backend/src/api/routes/pet.routes.js
import { Router } from 'express';
import { createPet, updatePet, deletePet, getAllPets, getPet } from '../controllers/pet.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger todas las rutas de mascotas
router.use(protect);

const allowedToCreate = authorize('Cliente', 'Recepcionista', 'Admin');
const allowedToModify = authorize('Cliente', 'Recepcionista', 'Veterinario', 'Admin');


// GET /api/pets -> Listar todas las mascotas (con filtros y paginación)
router.get('/', getAllPets);

// POST /api/pets -> Crear una nueva mascota
router.post('/', authorize('Cliente', 'Recepcionista', 'Admin'), createPet);

// GET /api/pets -> Listar una mascota por ID
router.get('/:id', getPet);

// PUT /api/pets/:id -> Actualizar una mascota
router.put('/:id', allowedToModify, updatePet);

// DELETE /api/pets/:id -> Eliminar una mascota (borrado lógico)
router.delete('/:id', allowedToModify, deletePet);

export default router;
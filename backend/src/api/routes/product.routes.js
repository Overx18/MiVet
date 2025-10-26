// backend/src/api/routes/product.routes.js
import { Router } from 'express';
import { createProduct, getAllProducts, updateStock } from '../controllers/product.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger todas las rutas de productos
router.use(protect);

const allowedToCreate = authorize('Admin', 'Recepcionista');
const allowedToManage = authorize('Admin', 'Recepcionista', 'Veterinario');

// GET /api/products -> Listar productos con filtros
router.get('/', allowedToManage, getAllProducts);

// POST /api/products -> Crear un nuevo producto
router.post('/', allowedToCreate, createProduct);

// PATCH /api/products/:id/stock -> Actualizar stock de un producto
router.patch('/:id/stock', allowedToCreate, updateStock);

export default router;
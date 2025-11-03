// backend/src/api/routes/product.routes.js
import { Router } from 'express';
import { createProduct, getAllProducts, updateStock, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger todas las rutas de productos
router.use(protect);

// GET /api/products -> Listar productos con filtros
router.get('/', authorize('Admin', 'Recepcionista', 'Veterinario', 'Groomer'), getAllProducts);

// POST /api/products -> Crear un nuevo producto
router.post('/', authorize('Admin'), createProduct);

// PATCH /api/products/:id/stock -> Actualizar stock de un producto
router.patch('/:id/stock', authorize('Admin', 'Recepcionista'), updateStock);

// PUT /api/products/:id -> Editar producto
router.put('/:id', authorize('Admin'), updateProduct);

// DELETE /api/products/:id -> Eliminar producto
router.delete('/:id', authorize('Admin'), deleteProduct);

export default router;
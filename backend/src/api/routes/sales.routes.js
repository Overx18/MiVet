// backend/src/api/routes/sale.routes.js
import { Router } from 'express';
import { processSale } from '../controllers/sale.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();
router.use(protect, authorize('Admin', 'Recepcionista'));

router.post('/', processSale);

export default router;
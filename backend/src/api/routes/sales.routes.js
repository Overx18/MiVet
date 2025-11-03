// backend/src/api/routes/sales.routes.js
import { Router } from 'express';
import { processSale, getClients } from '../controllers/sales.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(protect);

router.get('/clients', authorize('Recepcionista'), getClients);

router.post('/', authorize('Recepcionista'), processSale);

export default router;
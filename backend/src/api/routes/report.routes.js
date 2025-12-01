//Rutas para /api/reports
// backend/src/api/routes/report.routes.js
import { Router } from 'express';
import {
  generateIncomeReport,
  generateAppointmentsReport,
  generateInventoryReport,
  generateUsersReport,
} from '../controllers/report.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger para solo Admin
router.use(protect, authorize('Admin'));

router.get('/income', generateIncomeReport);
router.get('/appointments', generateAppointmentsReport);
router.get('/inventory', generateInventoryReport);
router.get('/users', generateUsersReport);

export default router;
// backend/src/api/routes/chatbot.routes.js
import { Router } from 'express';
import { processChatMessage, getPersonalizedReminders } from '../controllers/chatbot.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// Endpoint público para el chatbot (puede ser accedido sin autenticación o con autenticación opcional)
router.post('/message', processChatMessage);

// Endpoint protegido para recordatorios personalizados (solo usuarios autenticados)
router.get('/reminders', protect, getPersonalizedReminders);

export default router;
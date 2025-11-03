//Rutas para /api/appointments
// backend/src/api/routes/appointment.routes.js
import { Router } from 'express';
import { createAppointment, getProfessionalsByServiceType, getAvailableSlots, getAppointments, rescheduleAppointment, cancelAppointment } from '../controllers/appointment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Proteger todas las rutas
router.use(protect);

// GET /api/appointments -> Obtener citas para el calendario
router.get('/', authorize('Cliente', 'Recepcionista', 'Veterinario', 'Groomer'), getAppointments);

// Endpoint para obtener horarios disponibles
router.get('/availability', authorize('Cliente', 'Recepcionista'), getAvailableSlots);

// GET /api/appointments/professionals -> Obtener profesionales
router.get('/professionals', authorize('Cliente', 'Recepcionista'), getProfessionalsByServiceType);

// POST /api/appointments -> Crear una cita
router.post('/', authorize('Cliente', 'Recepcionista'), createAppointment);

// PATCH /api/appointments/:id/reschedule -> Reprogramar cita
router.patch('/:id/reschedule', authorize('Recepcionista', 'Admin', 'Cliente'), rescheduleAppointment);

// PATCH /api/appointments/:id/cancel -> Cancelar una cita
router.patch('/:id/cancel', authorize('Recepcionista', 'Admin', 'Cliente'), cancelAppointment);

export default router;
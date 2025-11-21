//Rutas para /api/medical-records

// backend/src/api/routes/medicalRecord.routes.js
import { Router } from 'express';

import { upsertMedicalRecord, getMedicalRecordByAppointmentId, getPetMedicalHistory } from '../controllers/medicalRecord.controller.js';
import { processAudioTranscription } from '../controllers/audioDocumentation.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();


router.use(protect);

// Crear o actualizar historial (Veterinario, Groomer, Admin)
router.post('/', authorize('Veterinario', 'Groomer', 'Admin'), upsertMedicalRecord);

// Obtener historial por ID de cita (Veterinario, Groomer, Admin)
router.get('/by-appointment/:appointmentId', authorize('Veterinario', 'Groomer', 'Admin', 'Cliente'), getMedicalRecordByAppointmentId);

// Obtener historial completo de una mascota (Todos los roles autenticados, la lógica de permisos está en el controller)
router.get('/by-pet/:petId', authorize('Veterinario', 'Groomer', 'Admin', 'Cliente'), getPetMedicalHistory);

// Procesar transcripción de audio (texto ya transcrito) para documentación automatizada (Veterinario, Groomer, Admin)
router.post('/process-audio', authorize('Veterinario', 'Groomer', 'Admin'), processAudioTranscription);

export default router;
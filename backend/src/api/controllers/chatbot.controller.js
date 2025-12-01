// backend/src/api/controllers/chatbot.controller.js
import createError from 'http-errors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../models/index.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const { Pet, MedicalRecord, Appointment } = db;

/**
 * Procesa un mensaje del usuario y genera una respuesta contextualizada usando Gemini
 */
export const processChatMessage = async (req, res, next) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return next(createError(400, 'El mensaje es obligatorio.'));
    }

    // Validar que existe la API key
    if (!process.env.GEMINI_API_KEY) {
      return next(createError(500, 'Servicio de chatbot no disponible temporalmente.'));
    }

    // Obtener contexto del usuario si está autenticado
    let userContext = '';
    if (userId && req.user?.id === userId) {
      const pets = await Pet.findAll({
        where: { ownerId: userId, isActive: true },
        attributes: ['name', 'species', 'breed', 'age'],
        limit: 3,
      });

      if (pets.length > 0) {
        userContext = `\n\nCONTEXTO DEL USUARIO:\nEl usuario tiene las siguientes mascotas registradas:\n${pets
          .map((p) => `- ${p.name} (${p.species}, ${p.breed || 'raza no especificada'}, ${p.age || 'edad no especificada'} años)`)
          .join('\n')}`;
      }

      // Obtener próximas citas
      const upcomingAppointments = await Appointment.findAll({
        where: { dateTime: { [db.Sequelize.Op.gte]: new Date() } },
        include: [{ model: Pet, where: { ownerId: userId }, attributes: ['name'] }],
        limit: 2,
        order: [['dateTime', 'ASC']],
      });

      if (upcomingAppointments.length > 0) {
        userContext += `\n\nPRÓXIMAS CITAS:\n${upcomingAppointments
          .map((a) => `- ${a.Pet.name} el ${new Date(a.dateTime).toLocaleDateString('es-ES')}`)
          .join('\n')}`;
      }
    }

    // Configurar el modelo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prompt del sistema para el chatbot veterinario
    const systemPrompt = `Eres un asistente veterinario virtual amigable y profesional llamado "VetBot" para el sistema de gestión veterinaria MiVet.

TU FUNCIÓN:
- Responder preguntas frecuentes sobre cuidado de mascotas (perros, gatos, aves, etc.)
- Proporcionar consejos básicos de salud animal
- Ayudar con recordatorios de vacunas y cuidados preventivos
- Orientar sobre síntomas comunes (SIN diagnosticar)
- Sugerir cuándo es necesario consultar con un veterinario

REGLAS IMPORTANTES:
1. NO diagnostiques enfermedades. Si el usuario describe síntomas preocupantes, recomienda contactar con un veterinario.
2. Mantén respuestas concisas (máximo 150 palabras) y amigables.
3. Si no sabes algo, admítelo y sugiere consultar con personal veterinario.
4. Para temas complejos, escala a "contactar con nuestro equipo vía email".
5. Usa un tono cálido pero profesional.
6. Si el usuario tiene mascotas registradas o citas, personaliza tu respuesta con esa información.

EJEMPLOS DE CONSULTAS QUE PUEDES RESPONDER:
- "¿Cada cuánto debo vacunar a mi perro?"
- "Mi gato come poco, ¿qué hago?"
- "¿Cómo cepillo los dientes de mi mascota?"
- "¿Cuándo debo desparasitar a mi cachorro?"

${userContext}

INSTRUCCIÓN: Responde SOLO con el texto de tu respuesta, sin formato markdown ni bloques de código.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUSUARIO: ${message}\n\nVETBOT:`);
    const response = await result.response;
    const botReply = response.text().trim();

    // [OPCIONAL] Registrar la interacción en base de datos para análisis
    // await ChatbotLog.create({ userId, userMessage: message, botResponse: botReply });

    res.status(200).json({
      success: true,
      message: botReply,
      isEscalated: botReply.toLowerCase().includes('contactar') || botReply.toLowerCase().includes('veterinario'),
    });
  } catch (error) {
    console.error('Error en chatbot:', error);
    next(createError(500, 'Error al procesar tu mensaje. Inténtalo de nuevo.'));
  }
};

/**
 * Obtener recordatorios personalizados para el usuario autenticado
 */
export const getPersonalizedReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminders = [];

    // Buscar mascotas con historial médico reciente
    const pets = await Pet.findAll({
      where: { ownerId: userId, isActive: true },
      include: [
        {
          model: MedicalRecord,
          as: 'medicalRecords',
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
    });

    for (const pet of pets) {
      const lastRecord = pet.medicalRecords?.[0];
      if (lastRecord) {
        const daysSinceLastVisit = Math.floor((Date.now() - new Date(lastRecord.createdAt)) / (1000 * 60 * 60 * 24));

        // Recordatorio de vacuna (ejemplo: cada 365 días)
        if (daysSinceLastVisit > 350) {
          reminders.push({
            petName: pet.name,
            type: 'Vacunación',
            message: `${pet.name} necesita su revisión anual. ¡Agenda una cita!`,
            priority: 'medium',
          });
        }

        // Recordatorio de desparasitación (ejemplo: cada 90 días)
        if (daysSinceLastVisit > 85 && daysSinceLastVisit < 100) {
          reminders.push({
            petName: pet.name,
            type: 'Desparasitación',
            message: `Es hora de desparasitar a ${pet.name}.`,
            priority: 'low',
          });
        }
      }
    }

    res.status(200).json({ success: true, reminders });
  } catch (error) {
    next(error);
  }
};
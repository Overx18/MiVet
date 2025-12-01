// backend/src/api/controllers/audioDocumentation.controller.js
import createError from 'http-errors';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar el cliente de Gemini
// Asegúrate de tener GEMINI_API_KEY en tu archivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Procesa texto transcrito y genera documentación médica estructurada usando Gemini
 * @param {string} transcribedText - Texto transcrito de la conversación
 * @returns {Promise<{diagnosis: string, treatment: string, notes: string}>}
 */
async function processTranscriptionWithNLP(transcribedText) {
  try {
    // Si no hay API key, usar procesamiento básico
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Falta GEMINI_API_KEY, usando procesamiento básico.');
      return processBasicExtraction(transcribedText);
    }

    // Configurar el modelo (gemini-1.5-flash es rápido y eficiente para texto)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt diseñado para extraer exactamente lo que pediste en formato JSON
    const prompt = `
      Actúa como un asistente veterinario experto. Tu tarea es analizar la siguiente transcripción de audio de una consulta y extraer la información clave.

      Transcripción: "${transcribedText}"

      Instrucciones:
      1. Identifica el Diagnóstico (problema o enfermedad detectada).
      2. Identifica el Tratamiento (medicamentos, dosis, procedimientos).
      3. Identifica Notas (recomendaciones, observaciones adicionales, próximas citas).
      
      IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido (sin bloques de código markdown \`\`\`json).
      El formato debe ser exactamente este:
      {
        "diagnosis": "Texto del diagnóstico aquí",
        "treatment": "Texto del tratamiento aquí",
        "notes": "Texto de las notas aquí"
      }
      Si no encuentras información para algún campo, pon "No especificado en el audio".
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Limpieza: A veces Gemini envuelve la respuesta en bloques de código markdown, los eliminamos
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const jsonResponse = JSON.parse(text);

      return {
        diagnosis: jsonResponse.diagnosis || "No especificado",
        treatment: jsonResponse.treatment || "No especificado",
        notes: jsonResponse.notes || "No especificado"
      };

    } catch (geminiError) {
      console.warn('Error interpretando respuesta de Gemini:', geminiError.message);
      // Si falla el parseo del JSON o la API, usamos el básico
      return processBasicExtraction(transcribedText);
    }

  } catch (error) {
    console.error('Error general procesando transcripción:', error);
    return processBasicExtraction(transcribedText);
  }
}

/**
 * Procesamiento básico sin API externa (Fallback)
 */
function processBasicExtraction(text) {
  const lowerText = text.toLowerCase();
  
  // Extraer diagnóstico (búsqueda simple de palabras clave)
  let diagnosis = '';
  const diagnosisKeywords = ['diagnóstico', 'diagnostico', 'problema', 'tiene', 'presenta'];
  const diagnosisIndex = diagnosisKeywords.findIndex(keyword => lowerText.includes(keyword));
  
  if (diagnosisIndex !== -1) {
    const startIndex = lowerText.indexOf(diagnosisKeywords[diagnosisIndex]);
    // Tomar un fragmento arbitrario
    diagnosis = text.substring(startIndex, Math.min(text.length, startIndex + 150)) + '...';
  }

  // Extraer tratamiento
  let treatment = '';
  const treatmentKeywords = ['tratamiento', 'receta', 'tomar', 'darle', 'aplicar', 'dosis'];
  const treatmentIndex = treatmentKeywords.findIndex(keyword => lowerText.includes(keyword));
  
  if (treatmentIndex !== -1) {
    const startIndex = lowerText.indexOf(treatmentKeywords[treatmentIndex]);
    treatment = text.substring(startIndex, Math.min(text.length, startIndex + 150)) + '...';
  }

  // Notas (el resto o un resumen simple)
  const notes = text.length > 300 ? 'Revisar transcripción completa para detalles.' : text;

  return {
    diagnosis: diagnosis || 'Revisar transcripción',
    treatment: treatment || 'Revisar transcripción',
    notes: notes,
  };
}

/**
 * Endpoint para procesar transcripción de audio
 */
export const processAudioTranscription = async (req, res, next) => {
  try {
    const { transcribedText, appointmentId } = req.body;

    if (!transcribedText || typeof transcribedText !== 'string') {
      return next(createError(400, 'El texto transcrito es requerido.'));
    }

    if (transcribedText.trim().length < 5) {
      return next(createError(400, 'El texto transcrito es demasiado corto.'));
    }

    // Procesar con Gemini NLP
    const structuredData = await processTranscriptionWithNLP(transcribedText);

    // [VERIFICACIÓN] Asegurarse de que la respuesta tiene el formato esperado
    res.status(200).json({
      success: true,
      data: {
        diagnosis: structuredData.diagnosis,
        treatment: structuredData.treatment,
        notes: structuredData.notes,
        transcription: transcribedText, // La transcripción completa se devuelve aquí
        appointmentId: appointmentId || null,
      },
      message: 'Documentación generada exitosamente con IA.',
    });
  } catch (error) {
    next(error);
  }
};
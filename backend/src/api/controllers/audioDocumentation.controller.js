// backend/src/api/controllers/audioDocumentation.controller.js
import createError from 'http-errors';
import { HfInference } from '@huggingface/inference';
    
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');

/**
 * Procesa texto transcrito y genera documentación médica estructurada
 * @param {string} transcribedText - Texto transcrito de la conversación
 * @returns {Promise<{diagnosis: string, treatment: string, notes: string}>}
 */
async function processTranscriptionWithNLP(transcribedText) {
  try {
    // Si no hay API key, usar procesamiento básico
    if (!process.env.HUGGINGFACE_API_KEY) {
      return processBasicExtraction(transcribedText);
    }

    // Usar Hugging Face para resumir y estructurar
    const prompt = `Eres un asistente veterinario. Analiza la siguiente conversación de una consulta veterinaria y extrae información estructurada. Responde SOLO en formato JSON con las siguientes claves: diagnosis, treatment, notes.

Conversación:
${transcribedText}

Responde en formato JSON válido:`;

    try {
      // Intentar usar un modelo de Hugging Face para procesamiento
      // Nota: Si no tienes API key, se usará procesamiento básico
      const response = await hf.chatCompletion({
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });

      const generatedText = response.choices?.[0]?.message?.content || "";
      
      
      // Intentar extraer JSON del texto generado
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
      try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            diagnosis: typeof parsed.diagnosis === "string"
              ? parsed.diagnosis
              : JSON.stringify(parsed.diagnosis ?? ""),
        
            treatment: typeof parsed.treatment === "string"
              ? parsed.treatment
              : JSON.stringify(parsed.treatment ?? ""),
          
            notes: typeof parsed.notes === "string"
              ? parsed.notes
              : JSON.stringify(parsed.notes ?? ""),
          };
          
      } catch (parseError) {
          console.warn('Error parseando JSON de Hugging Face:', parseError.message);
      }
      }
    } catch (hfError) {
      console.warn('Error con Hugging Face, usando procesamiento básico:', hfError.message);
      }
      
    // Fallback a procesamiento básico
      return processBasicExtraction(transcribedText);
  } catch (error) {
    console.error('Error procesando transcripción:', error);
    return processBasicExtraction(transcribedText);
  }
}

/**
 * Procesamiento básico sin API externa
 */
function processBasicExtraction(text) {
  const lowerText = text.toLowerCase();
  
  // Extraer diagnóstico (buscar palabras clave)
  let diagnosis = '';
  const diagnosisKeywords = ['diagnóstico', 'diagnostico', 'problema', 'enfermedad', 'condición', 'síntoma', 'sintoma'];
  const diagnosisIndex = diagnosisKeywords.findIndex(keyword => lowerText.includes(keyword));
  if (diagnosisIndex !== -1) {
    const startIndex = lowerText.indexOf(diagnosisKeywords[diagnosisIndex]);
    const excerpt = text.substring(Math.max(0, startIndex), Math.min(text.length, startIndex + 200));
    diagnosis = excerpt;
  }

  // Extraer tratamiento
  let treatment = '';
  const treatmentKeywords = ['tratamiento', 'medicamento', 'medicina', 'receta', 'prescripción', 'prescripcion', 'aplicar', 'administrar'];
  const treatmentIndex = treatmentKeywords.findIndex(keyword => lowerText.includes(keyword));
  if (treatmentIndex !== -1) {
    const startIndex = lowerText.indexOf(treatmentKeywords[treatmentIndex]);
    const excerpt = text.substring(Math.max(0, startIndex), Math.min(text.length, startIndex + 200));
    treatment = excerpt;
  }

  // Notas adicionales (todo el texto si no se encontró nada específico)
  const notes = text.length > 500 ? text.substring(0, 500) + '...' : text;

  return {
    diagnosis: diagnosis || 'Diagnóstico pendiente de revisión',
    treatment: treatment || 'Tratamiento pendiente de revisión',
    notes: notes || text,
  };
}

/**
 * Endpoint para procesar transcripción de audio
 */
export const processAudioTranscription = async (req, res, next) => {
  try {
    const { transcribedText, appointmentId } = req.body;
    const userId = req.user.id;

    if (!transcribedText || typeof transcribedText !== 'string') {
      return next(createError(400, 'El texto transcrito es requerido.'));
    }

    if (transcribedText.trim().length < 10) {
      return next(createError(400, 'El texto transcrito es demasiado corto.'));
    }

    // Procesar con NLP
    const structuredData = await processTranscriptionWithNLP(transcribedText);

    res.status(200).json({
      success: true,
      data: {
        diagnosis: structuredData.diagnosis,
        treatment: structuredData.treatment,
        notes: structuredData.notes,
        transcription: transcribedText, // Guardar la transcripción completa
        appointmentId: appointmentId || null,
      },
      message: 'Documentación generada exitosamente. Por favor, revisa y edita según sea necesario.',
    });
  } catch (error) {
    next(error);
  }
};
// frontend/src/components/medical-records/AudioRecordingDialog.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const processAudioTranscription = async ({ transcribedText, appointmentId, token }) => {
  const response = await apiClient.post(
    '/medical-records/process-audio',
    { transcribedText, appointmentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export default function AudioRecordingDialog({ open, onClose, appointmentId, onDataReceived }) {
  const { token } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const mutation = useMutation({
    mutationFn: processAudioTranscription,
    onSuccess: (response) => {
      toast.success('Documentación generada exitosamente');
      
      // [SOLUCIÓN] Asegurarse de que los datos se pasan correctamente
      if (onDataReceived && response.data) {
        onDataReceived(response.data);
      }
      
      setIsProcessing(false);
      
      // [SOLUCIÓN] Cerrar el diálogo después de un pequeño delay para que el usuario vea el toast
      setTimeout(() => {
        handleClose();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al procesar el audio');
      setIsProcessing(false);
    },
  });

  // Verificar si el navegador soporta Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tu navegador no soporta reconocimiento de voz. Por favor, usa Chrome o Edge.');
    }
  }, []);

  const startRecording = () => {
    if (!consentGiven) {
      toast.error('Debes dar tu consentimiento para grabar');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Reconocimiento de voz no disponible en este navegador');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      if (event.error === 'no-speech') {
        toast.error('No se detectó habla. Intenta de nuevo.');
      } else if (event.error === 'audio-capture') {
        toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
      } else {
        toast.error(`Error en reconocimiento: ${event.error}`);
      }
      stopRecording();
    };


    recognition.onend = () => {
      if (isRecording) {
        // Si aún está grabando, reiniciar
        try {
          recognition.start();
        } catch (e) {
          console.error('Error al reiniciar reconocimiento:', e);
        }
      }
    };


    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    toast.success('Grabación iniciada. Habla claramente.');
  };
    const stopRecording = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
  
  };

  const handleProcess = () => {
    if (!transcript.trim()) {
      toast.error('No hay texto transcrito para procesar');
      return;
    }

    setIsProcessing(true);

    mutation.mutate({
      transcribedText: transcript,
      appointmentId,
      token,
    });
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setTranscript('');
    setConsentGiven(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#E8EAF6',
          color: '#3F51B5',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MicIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documentación Clínica Automatizada
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={isProcessing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Consentimiento requerido:</strong> Esta funcionalidad grabará la conversación
            durante la consulta para generar documentación médica automática. Asegúrate de tener
            el consentimiento del cliente antes de iniciar la grabación.
          </Typography>
        </Alert>

        <FormControlLabel
          control={
            <Checkbox
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              disabled={isRecording || isProcessing}
              sx={{
                color: '#3F51B5',
                '&.Mui-checked': {
                  color: '#3F51B5',
                },
              }}
            />
          }
          label="Confirmo que tengo el consentimiento del cliente para grabar esta consulta"
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            {!isRecording ? (
              <Button
                variant="contained"
                startIcon={<MicIcon />}
                onClick={startRecording}
                disabled={!consentGiven || isProcessing}
                sx={{
                  backgroundColor: '#3F51B5',
                  '&:hover': {
                    backgroundColor: '#303F9F',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Iniciar Grabación
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopRecording}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Detener Grabación
              </Button>
            )}
          </Box>

          {isRecording && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#E57373',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 0.5,
                      transform: 'scale(1.2)',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                Grabando...
              </Typography>
            </Box>
          )}
        </Box>

        {transcript && (
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#F5F5F5',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#757575' }}>
              Transcripción:

            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#212121' }}>
              {transcript || 'No hay transcripción disponible...'}
            </Typography>
          </Paper>

        )}

        {isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="textSecondary">
              Procesando con IA...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#F8FAFC' }}>
        <Button onClick={handleClose} disabled={isProcessing || isRecording} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleProcess}
          variant="contained"
          disabled={!transcript.trim() || isProcessing || isRecording}
          startIcon={isProcessing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          sx={{
            backgroundColor: '#3F51B5',
            '&:hover': {
              backgroundColor: '#303F9F',
            },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isProcessing ? 'Procesando...' : 'Procesar y Generar Documentación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
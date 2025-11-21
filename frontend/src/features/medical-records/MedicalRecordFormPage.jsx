// frontend/src/features/medical-records/MedicalRecordPage.jsx
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container, Typography, Card, TextField, Button, Box, Autocomplete, IconButton, Paper, Alert,
} from '@mui/material';
import { 
  Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon, 
  Mic as MicIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import AudioRecordingDialog from '../../components/medical-records/AudioRecordingDialog';

// API Functions
const fetchRecord = (appointmentId, token) => apiClient.get(`/medical-records/by-appointment/${appointmentId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const upsertRecord = ({ recordData, token }) => apiClient.post('/medical-records', recordData, { headers: { Authorization: `Bearer ${token}` } });


export default function MedicalRecordPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);

  // Añadido setValue para que la mutación de audio pueda rellenar el formulario
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: { diagnosis: '', treatment: '', notes: '', productsUsed: [] },
  });
  
  // API fetch para los productos
  const fetchProducts = (token) =>
    apiClient
      .get('/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.data.products || []);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(token),
    enabled: !!token,
  });

    // Query para buscar un historial existente
  const { data: existingRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['medicalRecord', appointmentId],
    queryFn: () => fetchRecord(appointmentId, token),
    enabled: !!appointmentId && !!token,
  });

  // Efecto para poblar el formulario si se encuentra un registro existente
  useEffect(() => {
    if (existingRecord) {
      reset({
        diagnosis: existingRecord.diagnosis,
        treatment: existingRecord.treatment,
        notes: existingRecord.notes,
        productsUsed: existingRecord.products.map(p => ({
          product: p,
          quantityUsed: p.MedicalRecordProduct.quantityUsed,
        })),
      });
      // Guardar la transcripción si existe
      if (existingRecord.transcription) {
        setTranscription(existingRecord.transcription);
      }
    }
  }, [existingRecord, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'productsUsed' });

  const mutation = useMutation({
    mutationFn: upsertRecord,
    onSuccess: () => {
      toast.success('Historial médico guardado exitosamente.');
      navigate('/appointments/calendar');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al guardar.'),
  });

  const onSubmit = (data) => {
    const submissionData = {
      ...data,
      appointmentId,
      transcription: transcription || null, // Incluir la transcripción completa
      productsUsed: data.productsUsed.map(p => ({
        productId: p.product.id,
        quantityUsed: Number(p.quantityUsed),
      })),
    };
    mutation.mutate({ recordData: submissionData, token });
  };

  const handleAudioDataReceived = (data) => {
    // Rellenar automáticamente los campos con los datos procesados
    if (data.diagnosis) {
      setValue('diagnosis', data.diagnosis);
    }
    if (data.treatment) {
      setValue('treatment', data.treatment);
    }
    if (data.notes) {
      setValue('notes', data.notes);
    }
    // Guardar la transcripción completa (se guarda en BD pero no se muestra en el formulario)
    if (data.transcription) {
      setTranscription(data.transcription);
    }
    toast.success('Campos rellenados automáticamente. Por favor, revisa y edita según sea necesario.');
  };
  
  if (isLoadingRecord) return <div>Cargando historial...</div>;

    // Determinar si estamos en modo edición
  const isEditMode = !!existingRecord;

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Card sx={{ padding: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {isEditMode ? 'Editar Historial Médico' : 'Registrar Nuevo Historial Médico'}
          </Typography>
        </Box>

        {/* Botón de Documentación Automatizada */}
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>💡 Documentación Automatizada:</strong> Graba la conversación durante la consulta
              para generar automáticamente diagnóstico, tratamiento y notas usando IA.
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            startIcon={<MicIcon />}
            onClick={() => setAudioDialogOpen(true)}
            sx={{
              borderColor: '#3F51B5',
              color: '#3F51B5',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#303F9F',
                backgroundColor: '#E8EAF6',
              },
            }}
          >
            Iniciar Documentación Automatizada
          </Button>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Campo Diagnóstico */}
            <Box>
              <Controller
                name="diagnosis"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Diagnóstico"
                    fullWidth
                    multiline
                    rows={8}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem',
                      },
                      '& .MuiInputBase-input': {
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Campo Tratamiento */}
            <Box>
              <Controller
                name="treatment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tratamiento"
                    fullWidth
                    multiline
                    rows={8}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem',
                      },
                      '& .MuiInputBase-input': {
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Campo Notas */}
            <Box>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notas Adicionales"
                    fullWidth
                    multiline
                    rows={6}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem',
                      },
                      '& .MuiInputBase-input': {
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Productos Utilizados */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Productos Utilizados
              </Typography>
              {fields.map((field, index) => (
                <Paper 
                  key={field.id} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    p: 2, 
                    mb: 2,
                    width: '100%',
                  }}
                >
                  <Controller
                    name={`productsUsed.${index}.product`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, value, ...restField } }) => (
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option) => `${option.name} (Stock: ${option.quantity})`}
                        value={value || null}
                        onChange={(_, newValue) => onChange(newValue)}
                        sx={{ flexGrow: 1 }}
                        renderInput={(params) => <TextField {...params} label="Producto" />}
                        {...restField}
                      />
                    )}
                  />
                  <Controller 
                    name={`productsUsed.${index}.quantityUsed`} 
                    control={control} 
                    rules={{ required: true, min: 1 }} 
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Cantidad" 
                        type="number" 
                        sx={{ width: 120 }} 
                      />
                    )} 
                  />
                  <IconButton onClick={() => remove(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))}
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => append({ product: null, quantityUsed: 1 })}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Añadir Producto
              </Button>
            </Box>

            {/* Botón Guardar */}
            <Box>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<SaveIcon />} 
                disabled={mutation.isPending}
                size="large"
                sx={{ minWidth: 200 }}
              >
                {mutation.isPending ? 'Guardando...' : 'Guardar Historial'}
              </Button>
            </Box>
          </Box>
        </form>
      </Card>

      {/* Diálogo de Grabación de Audio */}
      <AudioRecordingDialog
        open={audioDialogOpen}
        onClose={() => setAudioDialogOpen(false)}
        appointmentId={appointmentId}
        onDataReceived={handleAudioDataReceived}
      />
    </Container>
  );
}
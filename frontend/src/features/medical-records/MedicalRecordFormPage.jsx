// frontend/src/features/medical-records/MedicalRecordPage.jsx
import { useEffect, useState } from 'react'; // Añadido useState
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container, Typography, Card, Grid, TextField, Button, Box, Autocomplete, IconButton, Paper,
  // Estos son los nuevos para el diálogo y la grabación
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon, 
  // ¡Especialmente estos íconos!
  Mic as MicIcon, Stop as StopIcon 
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// API Functions
const fetchRecord = (appointmentId, token) => apiClient.get(`/medical-records/by-appointment/${appointmentId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const upsertRecord = ({ recordData, token }) => apiClient.post('/medical-records', recordData, { headers: { Authorization: `Bearer ${token}` } });


export default function MedicalRecordPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

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
      productsUsed: data.productsUsed.map(p => ({
        productId: p.product.id,
        quantityUsed: Number(p.quantityUsed),
      })),
    };
    mutation.mutate({ recordData: submissionData, token });
  };
  
  if (isLoadingRecord) return <div>Cargando historial...</div>;

    // Determinar si estamos en modo edición
  const isEditMode = !!existingRecord;

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Card sx={{ padding: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {/* Título dinámico conservado del archivo original */}
            {isEditMode ? 'Editar Historial Médico' : 'Registrar Nuevo Historial Médico'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller name="diagnosis" control={control} render={({ field }) => <TextField {...field} label="Diagnóstico" fullWidth multiline rows={3} />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="treatment" control={control} render={({ field }) => <TextField {...field} label="Tratamiento" fullWidth multiline rows={3} />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="notes" control={control} render={({ field }) => <TextField {...field} label="Notas Adicionales" fullWidth multiline rows={2} />} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Productos Utilizados</Typography>
              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, mt: 2 }}>
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
                  <Controller name={`productsUsed.${index}.quantityUsed`} control={control} rules={{ required: true, min: 1 }} render={({ field }) => <TextField {...field} label="Cantidad" type="number" sx={{ width: 120 }} />} />
                  <IconButton onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                </Paper>
              ))}
              <Button startIcon={<AddIcon />} onClick={() => append({ product: null, quantityUsed: 1 })} sx={{ mt: 2 }}>
                Añadir Producto
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Historial'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Container>
  );
}
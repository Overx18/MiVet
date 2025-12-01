import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// ==== API FUNCTIONS ====

// Obtener especies disponibles
const fetchSpecies = async (token) => {
  const { data } = await apiClient.get('/species', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : data.species || [];
};

// Obtener lista de clientes (solo para recepcionistas)
const fetchClients = async (token) => {
  try {
    const { data } = await apiClient.get('/users?role=Cliente', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data?.users) ? data.users : [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

// Crear mascota
const createPet = async ({ petData, token }) => {
  const { data } = await apiClient.post('/pets', petData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ==== COMPONENTE PRINCIPAL ====

export default function PetRegistrationPage() {
  const { token, user } = useAuthStore();
  const isReceptionist = user?.role === 'Recepcionista';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      ownerId: '',
      name: '',
      speciesId: '',
      race: '',
      age: '',
      weight: '',
      gender: '',
      birthDate: '',
      notes: '',
    },
  });

  // Obtener especies
  const { data: speciesList = [], isLoading: loadingSpecies } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  // Obtener clientes (solo recepcionista)
  const { data: clientsList = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token && isReceptionist,
  });

  // Mutación: crear mascota
  const mutation = useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      toast.success('🐾 Mascota registrada correctamente');
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al registrar la mascota.');
    },
  });

  // Envío del formulario
  const onSubmit = (formData) => {
    const petData = {
      name: formData.name,
      speciesId: formData.speciesId,
      race: formData.race || null,
      age: formData.age ? Number(formData.age) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      gender: formData.gender || null,
      birthDate: formData.birthDate || null,
      notes: formData.notes || null,
      ...(isReceptionist ? { ownerId: formData.ownerId } : {}),
    };

    mutation.mutate({ petData, token });
  };

  // Estados de carga
  if (loadingSpecies || (isReceptionist && loadingClients)) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
          <PetsIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Registrar Nueva Mascota
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Completa los datos de tu mascota para registrarla en el sistema
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Info Alert */}
        <Alert severity="info" sx={{ marginBottom: 4, borderRadius: 1 }}>
          <Typography variant="body2">
            Los campos marcados con <strong>*</strong> son obligatorios.
          </Typography>
        </Alert>

        {/* Formulario */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Propietario (solo recepcionista) */}
          {isReceptionist && (
            <Controller
              name="ownerId"
              control={control}
              rules={{ required: 'Selecciona un cliente' }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.ownerId}
                  sx={{ marginBottom: 3 }}
                >
                  <InputLabel>Propietario *</InputLabel>
                  <Select
                    {...field}
                    label="Propietario *"
                    disabled={mutation.isPending}
                  >
                    <MenuItem value="">
                      <em>Selecciona un cliente</em>
                    </MenuItem>
                    {Array.isArray(clientsList) && clientsList.length > 0 ? (
                      clientsList.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No hay clientes disponibles</MenuItem>
                    )}
                  </Select>
                  {errors.ownerId && (
                    <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                      {errors.ownerId.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Nombre y Especie */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre de la Mascota *"
                    fullWidth
                    placeholder="Ej: Max"
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="speciesId"
                control={control}
                rules={{ required: 'Selecciona una especie' }}
                render={({ field }) => (
                <FormControl fullWidth error={!!errors.speciesId}>
                  <InputLabel shrink>Especie *</InputLabel>
                  <Select
                    {...field}
                    label="Especie *"
                    notched
                    displayEmpty
                    disabled={mutation.isPending}
                  >
                    <MenuItem value="">
                      <em>Selecciona una especie</em>
                    </MenuItem>
                    {speciesList.map((sp) => (
                      <MenuItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.speciesId && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#DC2626', mt: 0.5 }}
                    >
                      {errors.speciesId.message}
                    </Typography>
                  )}
                </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Raza y Género */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="race"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Raza"
                    fullWidth
                    placeholder="Ej: Labrador"
                    variant="outlined"
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel shrink>Género</InputLabel>
                    <Select
                      {...field}
                      label="Género"
                      notched
                      displayEmpty
                      disabled={mutation.isPending}
                    >
                      <MenuItem value="">
                        <em>Selecciona...</em>
                      </MenuItem>
                      <MenuItem value="Macho">Macho</MenuItem>
                      <MenuItem value="Hembra">Hembra</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Edad y Peso */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Edad (años)"
                    type="number"
                    fullWidth
                    placeholder="Ej: 3"
                    variant="outlined"
                    inputProps={{
                      min: 0,
                      step: 0.1,
                    }}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Peso (kg)"
                    type="number"
                    fullWidth
                    placeholder="Ej: 25.5"
                    variant="outlined"
                    inputProps={{
                      min: 0,
                      step: 0.1,
                    }}
                    disabled={mutation.isPending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            kg
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Fecha de nacimiento */}
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de nacimiento"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ marginBottom: 3 }}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Notas */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notas o Observaciones"
                multiline
                rows={4}
                fullWidth
                placeholder="Ej: Alergias, medicamentos, comportamiento especial..."
                variant="outlined"
                sx={{ marginBottom: 4 }}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Botones */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={mutation.isPending}
                startIcon={
                  mutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                }}
              >
                {mutation.isPending ? 'Guardando...' : 'Registrar Mascota'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => reset()}
                disabled={mutation.isPending || !isDirty}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                }}
              >
                Limpiar Formulario
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Info adicional */}
        <Alert severity="success" sx={{ marginTop: 3, borderRadius: 1 }}>
          <Typography variant="body2">
            💡 Después de registrar la mascota, podrás agendar citas veterinarias.
          </Typography>
        </Alert>
      </Card>
    </Container>
  );
}
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- Funciones de API ---
const fetchPetById = ({ id, token }) =>
  apiClient
    .get(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const updatePet = ({ id, petData, token }) =>
  apiClient.put(`/pets/${id}`, petData, { headers: { Authorization: `Bearer ${token}` } });

const deletePet = ({ id, token }) =>
  apiClient.delete(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });

const fetchSpecies = (token) =>
  apiClient
    .get('/species', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const fetchClients = async (token) => {
  const { data } = await apiClient.get('/users?role=Cliente', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data?.users) ? data.users : [];
};

export default function PetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // Query para obtener los datos de la mascota a editar
  const {
    data: pet,
    isLoading: isLoadingPet,
    isError,
    error,
  } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => fetchPetById({ id, token }),
    enabled: !!id && !!token,
  });

  // Queries para listas de especies y clientes
  const { data: speciesList = [], isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  const { data: clientsList = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token && (user?.role === 'Admin' || user?.role === 'Recepcionista'),
  });

  // Rellenar el formulario cuando los datos de la mascota se cargan
  useEffect(() => {
    if (pet) {
      let formattedBirthDate = pet.birthDate;

      // Verifica si birthDate existe y si es un string (formato ISO)
      if (pet.birthDate && typeof pet.birthDate === 'string') {
        // La fecha ISO es "YYYY-MM-DDTHH:mm:ss.sssZ". Tomamos solo la parte "YYYY-MM-DD"
        formattedBirthDate = pet.birthDate.split('T')[0];
      }

      // Asegurar que speciesId sea un string
      const speciesIdAsString = pet.speciesId ? String(pet.speciesId) : '';

      // ownerId para Admin/Recepcionista
      const ownerIdAsString = pet.ownerId ? String(pet.ownerId) : '';

      const formattedPet = {
        ...pet,
        birthDate: formattedBirthDate,
        speciesId: speciesIdAsString,
        ownerId: ownerIdAsString,
        age: pet.age ? Number(pet.age) : '',
        weight: pet.weight ? Number(pet.weight) : '',
        notes: pet.notes ?? '',
      };
      // 🔧 convierte todos los null a string vacío automáticamente
      Object.keys(formattedPet).forEach((key) => {
        if (formattedPet[key] === null || formattedPet[key] === undefined) {
          formattedPet[key] = '';
        }
      });
        reset(formattedPet);
      }
  }, [pet, reset]);

  // Mutación para actualizar la mascota
  const updateMutation = useMutation({
    mutationFn: updatePet,
    onSuccess: () => {
      toast.success('🐾 Mascota actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      navigate('/pets');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al actualizar la mascota.');
    },
  });

  // Mutación para eliminar la mascota
  const deleteMutation = useMutation({
    mutationFn: deletePet,
    onSuccess: () => {
      toast.success('🐾 Mascota eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setDeleteDialogOpen(false);
      navigate('/pets');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al eliminar la mascota.');
    },
  });

  const onSubmit = (data) => {
    const petData = {
      name: data.name,
      speciesId: data.speciesId,
      race: data.race || null,
      age: data.age ? Number(data.age) : null,
      weight: data.weight ? Number(data.weight) : null,
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      notes: data.notes || null,
      ...(user?.role === 'Admin' || user?.role === 'Recepcionista'
        ? { ownerId: data.ownerId }
        : {}),
    };

    updateMutation.mutate({ id, petData, token });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate({ id, token });
  };

  // --- Renderizado de carga ---
  if (
    isLoadingPet ||
    isLoadingSpecies ||
    (user?.role !== 'Cliente' && isLoadingClients)
  ) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // --- Renderizado de error ---
  if (isError) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error?.response?.data?.message || error?.message || 'Error al cargar la mascota'}
        </Alert>
        <Button
          component={RouterLink}
          to="/pets"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Volver a Mascotas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ marginBottom: 3 }}
      >
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Inicio
        </Link>
        <Link
          component={RouterLink}
          to="/pets"
          underline="hover"
          color="inherit"
        >
          Mascotas
        </Link>
        <Typography color="textSecondary">{pet?.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
        <PetsIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
        <Box>
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Editar Mascota
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Actualiza los datos de {pet?.name}
          </Typography>
        </Box>
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
          {/* Propietario (solo recepcionista/admin) */}
          {(user?.role === 'Admin' || user?.role === 'Recepcionista') && (
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
                    disabled={updateMutation.isPending}
                  >
                    <MenuItem value="">
                      <em>Selecciona un cliente</em>
                    </MenuItem>
                    {clientsList.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
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
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={updateMutation.isPending}
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
                  <FormControl
                    fullWidth
                    error={!!errors.speciesId}
                    disabled={updateMutation.isPending}
                  >
                    <InputLabel>Especie *</InputLabel>
                    <Select {...field} label="Especie *">
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
                      <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
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
                    disabled={updateMutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={updateMutation.isPending}>
                    <InputLabel>Género</InputLabel>
                    <Select {...field} label="Género">
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
                    disabled={updateMutation.isPending}
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
                    disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
              />
            )}
          />

          {/* Botones */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={updateMutation.isPending || !isDirty}
                startIcon={
                  updateMutation.isPending ? (
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
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/pets')}
                disabled={updateMutation.isPending}
                startIcon={<ArrowBackIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                }}
              >
                Volver
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="large"
                color="error"
                onClick={handleDeleteClick}
                disabled={updateMutation.isPending || deleteMutation.isPending}
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                }}
              >
                Eliminar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Info adicional */}
        <Alert severity="success" sx={{ marginTop: 3, borderRadius: 1 }}>
          <Typography variant="body2">
            💡 Actualiza solo los campos que necesites cambiar.
          </Typography>
        </Alert>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Eliminar Mascota
        </DialogTitle>
        <DialogContent sx={{ paddingY: 3 }}>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            <Typography variant="body2">
              ⚠️ Esta acción no se puede deshacer. Se eliminarán todos los datos de la mascota.
            </Typography>
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>{pet?.name}</strong> permanentemente?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={
              deleteMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Mascota'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
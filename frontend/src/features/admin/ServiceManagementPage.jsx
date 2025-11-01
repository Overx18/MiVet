import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storefront as StorefrontIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchServices = (token) =>
  apiClient
    .get('/services', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const addService = ({ serviceData, token }) =>
  apiClient
    .post('/services', serviceData, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const updateService = ({ id, serviceData, token }) =>
  apiClient
    .put(`/services/${id}`, serviceData, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const removeService = ({ id, token }) =>
  apiClient.delete(`/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });

const SERVICE_TYPES = ['Médico', 'Estético', 'Quirúrgico', 'Consulta'];

const TYPE_COLORS = {
  Médico: { bg: '#EFF6FF', text: '#1E40AF' },
  Estético: { bg: '#F0E7FE', text: '#7C3AED' },
  Quirúrgico: { bg: '#FEF3C7', text: '#B45309' },
  Consulta: { bg: '#F0FDF4', text: '#15803D' },
};

export default function ServiceManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      duration: '',
      type: '',
      description: '',
    },
  });

  // --- Queries ---
  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      toast.success('Servicio añadido exitosamente');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al añadir el servicio.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success('Servicio actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditingId(null);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el servicio.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeService,
    onSuccess: () => {
      toast.success('✅ Servicio eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteDialogOpen(false);
      setSelectedService(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el servicio.');
    },
  });

  // --- Handlers ---
  const onSubmit = (data) => {
    const serviceData = {
      name: data.name,
      price: Number(data.price),
      duration: Number(data.duration),
      type: data.type,
      description: data.description || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, serviceData, token });
    } else {
      addMutation.mutate({ serviceData, token });
    }
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedService) {
      deleteMutation.mutate({ id: selectedService.id, token });
    }
  };

  const handleEditClick = (service) => {
    setEditingId(service.id);
    reset({
      name: service.name,
      price: service.price,
      duration: service.duration,
      type: service.type,
      description: service.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  // --- Filtered Services ---
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType ? item.type === selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [services, searchTerm, selectedType]);

  // --- Calculated Stats ---
  const totalServices = services.length;
  const averagePrice = services.length > 0
    ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2)
    : 0;
  const totalTypes = new Set(services.map((s) => s.type)).size;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Alert severity="error">
          Error al cargar los servicios. Por favor, intenta nuevamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
          <StorefrontIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Catálogo de Servicios
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Gestiona los servicios ofrecidos por la clínica veterinaria
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#1E40AF',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E40AF', marginBottom: 0.5 }}>
              {totalServices}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total de Servicios
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#059669',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', marginBottom: 0.5 }}>
              S/ {averagePrice}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Precio Promedio
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#0F766E',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F766E', marginBottom: 0.5 }}>
              {totalTypes}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Tipos de Servicios
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#7C3AED',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#7C3AED', marginBottom: 0.5 }}>
              {filteredServices.length}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Resultados Búsqueda
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Layout: Formulario + Tabla */}
      <Grid container spacing={4}>
        {/* Formulario */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              padding: 3,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
              <AddIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
                {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Nombre */}
              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del Servicio *"
                    fullWidth
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    sx={{ marginBottom: 2.5 }}
                  />
                )}
              />

              {/* Precio */}
              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'El precio es obligatorio',
                  min: {
                    value: 0.01,
                    message: 'El precio debe ser mayor a 0',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio (S/) *"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    inputProps={{
                      step: '0.01',
                      min: '0',
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon sx={{ color: '#6B7280' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ marginBottom: 2.5 }}
                  />
                )}
              />

              {/* Duración */}
              <Controller
                name="duration"
                control={control}
                rules={{
                  required: 'La duración es obligatoria',
                  min: {
                    value: 5,
                    message: 'Mínimo 5 minutos',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Duración (minutos) *"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    inputProps={{
                      step: '5',
                      min: '5',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <ScheduleIcon sx={{ color: '#6B7280' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ marginBottom: 2.5 }}
                  />
                )}
              />

              {/* Tipo */}
              <Controller
                name="type"
                control={control}
                rules={{ required: 'El tipo es obligatorio' }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.type}
                    sx={{ marginBottom: 2.5 }}
                  >
                    <InputLabel>Tipo de Servicio *</InputLabel>
                    <Select
                      {...field}
                      label="Tipo de Servicio *"
                      disabled={addMutation.isPending || updateMutation.isPending}
                    >
                      <MenuItem value="">
                        <em>Selecciona un tipo...</em>
                      </MenuItem>
                      {SERVICE_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              {/* Descripción */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    disabled={addMutation.isPending || updateMutation.isPending}
                    sx={{ marginBottom: 3 }}
                  />
                )}
              />

              {/* Botones */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={addMutation.isPending || updateMutation.isPending}
                  startIcon={
                    addMutation.isPending || updateMutation.isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {editingId
                    ? updateMutation.isPending
                      ? 'Actualizando...'
                      : 'Actualizar'
                    : addMutation.isPending
                    ? 'Añadiendo...'
                    : 'Añadir Servicio'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Tabla */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header con Filtros */}
            <Box
              sx={{
                padding: 3,
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#6B7280' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtrar por tipo</InputLabel>
                    <Select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      label="Filtrar por tipo"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {SERVICE_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Empty State */}
            {filteredServices.length === 0 ? (
              <Box sx={{ textAlign: 'center', paddingY: 6 }}>
                <StorefrontIcon
                  sx={{
                    fontSize: 48,
                    color: '#D1D5DB',
                    marginBottom: 2,
                  }}
                />
                <Typography variant="body1" color="textSecondary">
                  {services.length === 0
                    ? 'No hay servicios registrados aún.'
                    : 'No se encontraron servicios con ese término de búsqueda.'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'right' }}>
                          Precio
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                          Duración
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow
                          key={service.id}
                          sx={{
                            borderBottom: '1px solid #E5E7EB',
                            '&:hover': {
                              backgroundColor: '#F8FAFC',
                            },
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {service.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {service.description || '—'}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                              S/ {Number(service.price || 0).toFixed(2)}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={`${service.duration} min`}
                              size="small"
                              sx={{
                                backgroundColor: '#EFF6FF',
                                color: '#1E40AF',
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={service.type}
                              sx={{
                                backgroundColor: TYPE_COLORS[service.type]?.bg || '#F3F4F6',
                                color: TYPE_COLORS[service.type]?.text || '#1F2937',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleEditClick(service)}
                                startIcon={<EditIcon fontSize="small" />}
                                sx={{
                                  textTransform: 'none',
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(service)}
                                startIcon={<DeleteIcon fontSize="small" />}
                                sx={{
                                  textTransform: 'none',
                                }}
                              >
                                Eliminar
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Results Info */}
                <Box
                  sx={{
                    padding: 2,
                    textAlign: 'right',
                    borderTop: '1px solid #E5E7EB',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                    Mostrando {filteredServices.length} de {services.length} servicios
                  </Typography>
                </Box>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Eliminar Servicio
        </DialogTitle>
        <DialogContent sx={{ paddingY: 3 }}>
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            <Typography variant="body2">
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </Typography>
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar el servicio{' '}
            <strong>{selectedService?.name}</strong> (S/ {selectedService?.price})?
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
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Servicio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
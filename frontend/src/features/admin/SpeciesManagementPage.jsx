import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- API Functions ---
const fetchSpecies = (token) =>
  apiClient
    .get('/species', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const addSpecies = ({ speciesData, token }) =>
  apiClient
    .post('/species', speciesData, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const updateSpecies = ({ id, speciesData, token }) =>
  apiClient
    .put(`/species/${id}`, speciesData, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const removeSpecies = ({ id, token }) =>
  apiClient.delete(`/species/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default function SpeciesManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', description: '' },
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', description: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  // --- Queries ---
  const { data: species = [], isLoading, isError } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: addSpecies,
    onSuccess: () => {
      toast.success('Especie añadida exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
      reset();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al añadir especie.';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSpecies,
    onSuccess: () => {
      toast.success('Especie actualizada exitosamente.');
      setEditingId(null);
      setEditValues({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al actualizar la especie.';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeSpecies,
    onSuccess: () => {
      toast.success('Especie eliminada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
      setDeleteDialogOpen(false);
      setSelectedSpecies(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al eliminar la especie.';
      toast.error(message);
    },
  });

  // --- Handlers ---
  const onSubmit = (data) => {
    addMutation.mutate({ speciesData: data, token });
  };

  const handleDeleteClick = (item) => {
    setSelectedSpecies(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSpecies) {
      deleteMutation.mutate({ id: selectedSpecies.id, token });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, description: item.description || '' });
  };

  const handleSaveEdit = () => {
    if (!editValues.name.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    updateMutation.mutate({
      id: editingId,
      speciesData: editValues,
      token,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', description: '' });
  };

  // --- Filtered Species ---
  const filteredSpecies = useMemo(() => {
    return species.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [species, searchTerm]);

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
          Error al cargar las especies. Por favor, intenta nuevamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
          <CategoryIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Catálogo de Especies
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Gestiona las especies disponibles en el sistema
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card
        sx={{
          padding: 2.5,
          marginBottom: 4,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E40AF' }}>
              {species.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total de Especies
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="textSecondary">
              {filteredSpecies.length} coincidencias
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Formulario de Creación */}
      <Card
        sx={{
          padding: 3,
          marginBottom: 4,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
          <AddIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
            Añadir Nueva Especie
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5} sx={{ marginBottom: 3 }}>
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
                    label="Nombre de la Especie"
                    fullWidth
                    placeholder="Ej: Felino domestico"
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={addMutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="description"
                control={control}
                rules={{
                  maxLength: {
                    value: 255,
                    message: 'Máximo 255 caracteres',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    fullWidth
                    placeholder="Ej: Características, hábitat..."
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={addMutation.isPending}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            disabled={addMutation.isPending}
            startIcon={
              addMutation.isPending ? (
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
            {addMutation.isPending ? 'Añadiendo...' : 'Añadir Especie'}
          </Button>
        </Box>
      </Card>

      {/* Lista de Especies */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header con búsqueda */}
        <Box
          sx={{
            padding: 3,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Especies Registradas
            </Typography>
            <TextField
              size="small"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6B7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: '300px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* Empty State */}
        {filteredSpecies.length === 0 ? (
          <Box sx={{ textAlign: 'center', paddingY: 6 }}>
            <CategoryIcon
              sx={{
                fontSize: 48,
                color: '#D1D5DB',
                marginBottom: 2,
              }}
            />
            <Typography variant="body1" color="textSecondary">
              {species.length === 0
                ? 'No hay especies registradas aún.'
                : 'No se encontraron especies con ese término de búsqueda.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSpecies.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      borderBottom: '1px solid #E5E7EB',
                      '&:hover': {
                        backgroundColor: '#F8FAFC',
                      },
                    }}
                  >
                    {/* Nombre */}
                    <TableCell>
                      {editingId === item.id ? (
                        <TextField
                          size="small"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({ ...editValues, name: e.target.value })
                          }
                          variant="outlined"
                          fullWidth
                          disabled={updateMutation.isPending}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                          {item.name}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Descripción */}
                    <TableCell>
                      {editingId === item.id ? (
                        <TextField
                          size="small"
                          value={editValues.description}
                          onChange={(e) =>
                            setEditValues({ ...editValues, description: e.target.value })
                          }
                          variant="outlined"
                          fullWidth
                          disabled={updateMutation.isPending}
                        />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          {item.description || '—'}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell sx={{ textAlign: 'center' }}>
                      {editingId === item.id ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={handleSaveEdit}
                            disabled={updateMutation.isPending}
                            startIcon={<SaveIcon fontSize="small" />}
                            sx={{ textTransform: 'none' }}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                            startIcon={<CloseIcon fontSize="small" />}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(item)}
                            startIcon={<EditIcon fontSize="small" />}
                            sx={{ textTransform: 'none' }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(item)}
                            startIcon={<DeleteIcon fontSize="small" />}
                            sx={{ textTransform: 'none' }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Results Count */}
        {filteredSpecies.length > 0 && (
          <Box
            sx={{
              padding: 2,
              textAlign: 'right',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#F8FAFC',
            }}
          >
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Mostrando {filteredSpecies.length} de {species.length} especies
            </Typography>
          </Box>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Eliminar Especie
        </DialogTitle>
        <DialogContent sx={{ paddingY: 3 }}>
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            <Typography variant="body2">
              Esta acción no se puede deshacer. La especie será eliminada permanentemente.
            </Typography>
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar la especie{' '}
            <strong>{selectedSpecies?.name}</strong>?
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
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Especie'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Pagination,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// ==== API FUNCTIONS ====
const fetchPets = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/pets?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);
};

const deletePetById = ({ id, token }) =>
  apiClient.delete(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// ==== COMPONENTE PRINCIPAL ====
export default function PetListPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ownerName: '', page: 1, limit: 10 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pets', filters],
    queryFn: () => fetchPets(filters, token),
    enabled: !!token,
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePetById,
    onSuccess: () => {
      toast.success('🐾 Mascota desactivada correctamente');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setDeleteDialogOpen(false);
      setSelectedPet(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desactivar la mascota.');
    },
  });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (pet) => {
    setSelectedPet(pet);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPet) {
      deleteMutation.mutate({ id: selectedPet.id, token });
    }
  };

  // 🔒 Verificar roles con permiso
  const canRegister =
    user?.role === 'Recepcionista' ||
    user?.role === 'Admin' ||
    user?.role === 'Cliente';
  const canEditOrDelete =
    user?.role === 'Recepcionista' ||
    user?.role === 'Admin' ||
    user?.role === 'Cliente';

  // Calcular estadísticas
  const totalActivePets = data?.pets?.filter((p) => p.isActive).length || 0;
  const totalInactivePets = data?.pets?.filter((p) => !p.isActive).length || 0;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              Listado de Mascotas
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gestiona todas las mascotas registradas en el sistema
            </Typography>
          </Box>
        </Box>

        {/* Botón Registrar */}
        {canRegister && (
          <Button
            component={RouterLink}
            to="/pets/register"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Registrar Mascota
          </Button>
        )}
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
              {data?.pets?.length || 0}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total de Mascotas
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
              {totalActivePets}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Activas
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
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#DC2626',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#DC2626', marginBottom: 0.5 }}>
              {totalInactivePets}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Inactivas
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
              {data?.totalPages || 1}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Página{data?.totalPages !== 1 ? 's' : ''}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card
        sx={{
          padding: 3,
          marginBottom: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, marginBottom: 2, color: '#1F2937' }}>
          🔍 Filtros de Búsqueda
        </Typography>
        <TextField
          fullWidth
          name="ownerName"
          placeholder="Buscar por nombre del propietario o mascota..."
          value={filters.ownerName}
          onChange={handleFilterChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Tabla de Mascotas */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: 3,
        }}
      >
        {/* Empty State */}
        {(!data?.pets || data.pets.length === 0) && !isLoading ? (
          <Box sx={{ textAlign: 'center', paddingY: 6 }}>
            <PetsIcon
              sx={{
                fontSize: 48,
                color: '#D1D5DB',
                marginBottom: 2,
              }}
            />
            <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 2 }}>
              No se encontraron mascotas
            </Typography>
            {canRegister && (
              <Button
                component={RouterLink}
                to="/pets/register"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Registrar Primera Mascota
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Propietario</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Mascota</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Especie</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Raza</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                      Estado
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.pets?.map((pet) => (
                    <TableRow
                      key={pet.id}
                      sx={{
                        borderBottom: '1px solid #E5E7EB',
                        opacity: pet.isActive ? 1 : 0.6,
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                      }}
                    >
                      {/* Propietario */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              backgroundColor: pet.isActive ? '#1E40AF' : '#9CA3AF',
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {pet.owner?.firstName?.charAt(0).toUpperCase()}
                            {pet.owner?.lastName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {pet.owner?.firstName} {pet.owner?.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {pet.owner?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Nombre Mascota */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            textDecoration: pet.isActive ? 'none' : 'line-through',
                            color: pet.isActive ? '#1F2937' : '#9CA3AF',
                          }}
                        >
                          {pet.name}
                        </Typography>
                      </TableCell>

                      {/* Especie */}
                      <TableCell>
                        <Typography variant="body2">{pet.species?.name || '—'}</Typography>
                      </TableCell>

                      {/* Raza */}
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {pet.race || '—'}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={pet.isActive ? 'Activo' : 'Inactivo'}
                          sx={{
                            backgroundColor: pet.isActive ? '#D1FAE5' : '#FEE2E2',
                            color: pet.isActive ? '#059669' : '#DC2626',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      {/* Acciones */}
                      {canEditOrDelete && (
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                              component={RouterLink}
                              to={`/pets/${pet.id}/edit`}
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                            >
                              Editar
                            </Button>

                            <Button
                              component={RouterLink}
                              to={`/pets/${pet.id}/history`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<HistoryIcon fontSize="small" />}
                            >
                              Historial
                            </Button>

                            {pet.isActive && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteClick(pet)}
                                startIcon={<DeleteIcon fontSize="small" />}
                              >
                                Desactivar
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      )}

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
                Mostrando {data?.pets?.length || 0} de {data?.total || 0} mascotas
              </Typography>
            </Box>
          </>
        )}
      </Card>

      {/* Paginación */}
      {data?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Página {data?.currentPage} de {data?.totalPages}
          </Typography>
          <Pagination
            count={data?.totalPages || 1}
            page={data?.currentPage || 1}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ marginTop: 4, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InfoIcon sx={{ marginTop: 0.5, flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.5 }}>
              💡 Tips útiles:
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.6 }}>
              • Usa la búsqueda para filtrar mascotas por propietario<br />
              • Haz clic en "Editar" para actualizar información de la mascota<br />
              • Solo se pueden desactivar mascotas activas<br />
              • Las mascotas desactivadas aparecen atenuadas en la lista
            </Typography>
          </Box>
        </Box>
      </Alert>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Desactivar Mascota
        </DialogTitle>
        <DialogContent sx={{ paddingY: 3 }}>
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            <Typography variant="body2">
              Desactivar una mascota no eliminará sus registros, solo la ocultará de futuros registros.
            </Typography>
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas desactivar a{' '}
            <strong>{selectedPet?.name}</strong> (propietario: {selectedPet?.owner?.firstName} {selectedPet?.owner?.lastName})?
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
            {deleteMutation.isPending ? 'Desactivando...' : 'Desactivar Mascota'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
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
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const ROLES = ['Admin', 'Cliente', 'Veterinario', 'Recepcionista', 'Groomer'];

const ROLE_COLORS = {
  Admin: { bg: '#EFF6FF', text: '#1E40AF' },
  Cliente: { bg: '#F0FDF4', text: '#15803D' },
  Veterinario: { bg: '#F0E7FE', text: '#7C3AED' },
  Recepcionista: { bg: '#FEF3C7', text: '#B45309' },
  Groomer: { bg: '#FCE7F3', text: '#BE185D' },
};

// Funciones de API
const fetchUsers = async (token) => {
  const { data } = await apiClient.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.users;
};

const updateUserRole = async ({ userId, role, token }) => {
  const { data } = await apiClient.put(`/users/${userId}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const toogleUserStatus = async ({ userId, isActive, token }) => {
  const { data } = await apiClient.patch(`/users/${userId}/toggle-status`, { isActive }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function UserManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [toogleStatusDialogOpen, setToogleStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Activo');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (data) => {
      toast.success(data.message || 'Rol actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el rol.');
    },
  });

  const toogleStatusMutation = useMutation({
    mutationFn: toogleUserStatus,
    onSuccess: (data) => {
      toast.success(data.message || 'Estado del usuario actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setToogleStatusDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el estado del usuario.');
    },
  });

  const handleRoleChange = (userId, newRole) => {
    roleMutation.mutate({ userId, role: newRole, token });
  };

  const handleToogleStatusClick = (user) => {
    setSelectedUser(user);
    setToogleStatusDialogOpen(true);
  };

  const handleConfirmToogleStatus = () => {
    if (selectedUser) {
      toogleStatusMutation.mutate({ 
        userId: selectedUser.id, 
        isActive: !selectedUser.isActive,
        token 
      });
    }
  };

  // Filtrar usuarios
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    const matchesStatus =
      selectedStatus === 'Todos'
        ? true
        : selectedStatus === 'Activo'
        ? user.isActive
        : !user.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calcular estadísticas solo de usuarios activos
  const activeUsers = users?.filter((u) => u.isActive) || [];
  const activeAdmins = activeUsers.filter((u) => u.role === 'Admin').length;
  const activeVeterinarios = activeUsers.filter((u) => u.role === 'Veterinario').length;
  const activeClientes = activeUsers.filter((u) => u.role === 'Cliente').length;

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
      <Box sx={{ marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
          <PeopleIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Gestión de Usuarios
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Administra los usuarios del sistema y asigna roles
        </Typography>
      </Box>

      {/* Stats Cards - Solo usuarios activos */}
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
              {activeUsers.length}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Usuarios Activos
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
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#1E40AF',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E40AF', marginBottom: 0.5 }}>
              {activeAdmins}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Administradores
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
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#059669',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', marginBottom: 0.5 }}>
              {activeVeterinarios}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Veterinarios
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
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.12)',
                transform: 'translateY(-2px)',
                borderColor: '#0F766E',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F766E', marginBottom: 0.5 }}>
              {activeClientes}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
              Clientes
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card
        sx={{
          padding: 3,
          marginBottom: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre o email..."
              variant="outlined"
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
            <Select
              fullWidth
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="">Todos los roles</MenuItem>
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Select
              fullWidth
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="Activo">Activos</MenuItem>
              <MenuItem value="Inactivo">Inactivos</MenuItem>
              <MenuItem value="Todos">Todos</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Cambiar Rol</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      borderBottom: '1px solid #E5E7EB',
                      opacity: user.isActive ? 1 : 0.6,
                      '&:hover': {
                        backgroundColor: '#F8FAFC',
                      },
                    }}
                  >
                    {/* Usuario */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: user.isActive ? '#1E40AF' : '#9CA3AF',
                            width: 36,
                            height: 36,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {user.firstName?.charAt(0).toUpperCase()}
                          {user.lastName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              textDecoration: user.isActive ? 'none' : 'line-through',
                              color: user.isActive ? '#1F2937' : '#9CA3AF',
                            }}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.phone || 'Sin teléfono'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: user.isActive ? '#1F2937' : '#9CA3AF',
                        }}
                      >
                        {user.email}
                      </Typography>
                    </TableCell>

                    {/* Rol Actual */}
                    <TableCell>
                      <Chip
                        label={user.role}
                        sx={{
                          backgroundColor: ROLE_COLORS[user.role]?.bg || '#F3F4F6',
                          color: ROLE_COLORS[user.role]?.text || '#1F2937',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Activo' : 'Inactivo'}
                        icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        sx={{
                          backgroundColor: user.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: user.isActive ? '#059669' : '#DC2626',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    {/* Cambiar Rol */}
                    <TableCell>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={roleMutation.isPending || !user.isActive}
                        sx={{
                          minWidth: 120,
                          fontSize: '0.875rem',
                        }}
                      >
                        {ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell sx={{ textAlign: 'center' }}>
                      {user.isActive ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleToogleStatusClick(user)}
                          disabled={toogleStatusMutation.isPending}
                          startIcon={<BlockIcon fontSize="small" />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleToogleStatusClick(user)}
                          disabled={toogleStatusMutation.isPending}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Activar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', paddingY: 4 }}>
                    <Typography color="textSecondary">
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Toggle Status Confirmation Dialog */}
      <Dialog
        open={toogleStatusDialogOpen}
        onClose={() => setToogleStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          {selectedUser?.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
        </DialogTitle>
        <DialogContent sx={{ paddingY: 3 }}>
          <Alert 
            severity={selectedUser?.isActive ? 'warning' : 'info'} 
            sx={{ marginBottom: 2 }}
          >
            <Typography variant="body2">
              {selectedUser?.isActive 
                ? 'El usuario no podrá acceder al sistema si está desactivado.'
                : 'El usuario podrá acceder al sistema nuevamente.'}
            </Typography>
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas {selectedUser?.isActive ? 'desactivar' : 'activar'} a{' '}
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={() => setToogleStatusDialogOpen(false)}
            variant="outlined"
            disabled={toogleStatusMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmToogleStatus}
            variant="contained"
            color={selectedUser?.isActive ? 'error' : 'success'}
            disabled={toogleStatusMutation.isPending}
            startIcon={
              toogleStatusMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : selectedUser?.isActive ? (
                <BlockIcon />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {toogleStatusMutation.isPending 
              ? 'Procesando...' 
              : selectedUser?.isActive 
              ? 'Desactivar Usuario'
              : 'Activar Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
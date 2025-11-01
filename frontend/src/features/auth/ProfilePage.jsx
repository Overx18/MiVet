import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Password as PasswordIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchProfile = async (token) => {
  const { data } = await apiClient.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateUserProfile = async ({ profileData, token }) => {
  const { data } = await apiClient.put('/users/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function ProfilePage() {
  const { token, setUser, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watchPassword('newPassword');

  // 1. Obtener datos del perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchProfile(token),
    enabled: !!token,
  });

  // 2. Poblar el formulario cuando los datos del perfil se cargan
  useEffect(() => {
    if (profile?.user) {
      reset(profile.user);
    } else if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  // 3. Mutación para actualizar el perfil
  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success(data.message || 'Perfil actualizado correctamente');
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil.');
    },
  });

  // Mutación para cambiar contraseña
  const passwordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const { data } = await apiClient.put('/users/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Contraseña actualizada correctamente');
      setShowPasswordDialog(false);
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña.');
    },
  });

  const onSubmit = (data) => {
    const { password, ...profileData } = data;
    mutation.mutate({ profileData, token });
  };

  const onPasswordSubmit = (data) => {
    const { confirmPassword, ...passwordData } = data;
    passwordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h1"
          sx={{
            marginBottom: 1,
            color: '#1F2937',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 700,
          }}
        >
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Administra tu información personal y configuración de cuenta
        </Typography>
      </Box>

      {/* Avatar Section */}
      <Card
        sx={{
          padding: 3,
          marginBottom: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            backgroundColor: '#1E40AF',
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 auto',
            marginBottom: 2,
          }}
        >
          {user?.firstName?.charAt(0).toUpperCase()}
          {user?.lastName?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: 0.5 }}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.email}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'inline-block',
            marginTop: 1,
            padding: '4px 12px',
            backgroundColor: '#F3F4F6',
            borderRadius: 1,
            color: '#1E40AF',
            fontWeight: 600,
          }}
        >
          Rol: {user?.role}
        </Typography>
      </Card>

      {/* Información Personal */}
      <Card
        sx={{
          padding: 3,
          marginBottom: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
          <EditIcon sx={{ color: '#1E40AF', marginRight: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Información Personal
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: 3, borderColor: '#E5E7EB' }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Nombre y Apellido */}
          <Grid container spacing={2.5} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
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
                    label="Nombre"
                    fullWidth
                    variant="outlined"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: 'El apellido es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apellido"
                    fullWidth
                    variant="outlined"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Email (No editable) */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo Electrónico"
                type="email"
                fullWidth
                variant="outlined"
                disabled
                sx={{ marginBottom: 2.5 }}
                helperText="El email no puede ser modificado"
              />
            )}
          />

          {/* Teléfono */}
          <Controller
            name="phone"
            control={control}
            rules={{
              pattern: {
                value: /^[0-9\s\-\+\(\)]*$/,
                message: 'Ingresa un teléfono válido',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Teléfono"
                type="tel"
                fullWidth
                variant="outlined"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={{ marginBottom: 2.5 }}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Dirección */}
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dirección"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 3 }}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Botones de acción */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!isDirty || mutation.isPending}
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
                {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setShowPasswordDialog(true)}
                startIcon={<PasswordIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                }}
              >
                Cambiar Contraseña
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Información de Cuenta */}
      <Card
        sx={{
          padding: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          backgroundColor: '#F8FAFC',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
          Información de la Cuenta
        </Typography>
        <Divider sx={{ marginBottom: 2, borderColor: '#E5E7EB' }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Rol
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 0.5, fontWeight: 500 }}>
              {user?.role}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Estado
            </Typography>
            <Typography
              variant="body2"
              sx={{
                marginTop: 0.5,
                fontWeight: 500,
                color: '#059669',
              }}
            >
              Activo
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Miembro desde
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 0.5, fontWeight: 500 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Última actualización
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 0.5, fontWeight: 500 }}>
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Dialog para cambiar contraseña */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Cambiar Contraseña
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingY: 3 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Contraseña Actual */}
            <Controller
              name="currentPassword"
              control={passwordControl}
              rules={{
                required: 'La contraseña actual es obligatoria',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contraseña Actual"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword?.message}
                  disabled={passwordMutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Nueva Contraseña */}
            <Controller
              name="newPassword"
              control={passwordControl}
              rules={{
                required: 'La nueva contraseña es obligatoria',
                minLength: {
                  value: 8,
                  message: 'Mínimo 8 caracteres',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe contener mayúscula, minúscula y número',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nueva Contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword?.message}
                  disabled={passwordMutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Confirmar Contraseña */}
            <Controller
              name="confirmPassword"
              control={passwordControl}
              rules={{
                required: 'Confirma tu contraseña',
                validate: (value) =>
                  value === newPassword || 'Las contraseñas no coinciden',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar Contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                  disabled={passwordMutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={() => setShowPasswordDialog(false)}
            variant="outlined"
            disabled={passwordMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordSubmit(onPasswordSubmit)}
            variant="contained"
            disabled={passwordMutation.isPending}
            startIcon={
              passwordMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            {passwordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
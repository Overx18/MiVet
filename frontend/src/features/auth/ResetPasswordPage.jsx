import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';

// Función para resetear la contraseña
const resetPassword = async ({ token, password }) => {
  const { data } = await apiClient.patch(`/auth/reset-password/${token}`, {
    password,
  });
  return data;
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Contraseña actualizada correctamente');
      setPasswordReset(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'El enlace es inválido o ha expirado. Por favor, solicita uno nuevo.'
      );
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ token, password: data.password });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Estado de éxito
  if (passwordReset) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E40AF 0%, #0F766E 100%)',
          paddingY: 4,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              padding: { xs: 3, sm: 4 },
              borderRadius: 2,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            {/* Icono de éxito */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: '#059669' }} />
            </Box>

            {/* Título */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                marginBottom: 1,
              }}
            >
              ¡Contraseña Actualizada!
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ marginBottom: 3, lineHeight: 1.6 }}
            >
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión en unos momentos.
            </Typography>

            {/* Loader */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginY: 2 }}>
              <CircularProgress />
            </Box>

            {/* Descripción */}
            <Typography variant="caption" color="textSecondary">
              Si no eres redirigido automáticamente, haz clic en el botón de abajo.
            </Typography>
          </Card>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', marginTop: 4 }}>
            <Typography variant="caption" sx={{ color: '#FFFFFF', opacity: 0.8 }}>
              © 2025 MiVet. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E40AF 0%, #0F766E 100%)',
        paddingY: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            padding: { xs: 3, sm: 4 },
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Logo y Título */}
          <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'rgba(30, 64, 175, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: 2,
              }}
            >
              <LockResetIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
            </Box>
            <Typography
              variant="h2"
              sx={{
                color: '#1E40AF',
                fontWeight: 700,
                marginBottom: 0.5,
                fontSize: { xs: '1.75rem', sm: '2rem' },
              }}
            >
              Establecer Contraseña
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: '0.95rem' }}>
              Crea una nueva contraseña para tu cuenta
            </Typography>
          </Box>

          {/* Alerta de Error */}
          {mutation.isError && (
            <Alert severity="error" sx={{ marginBottom: 3, borderRadius: 1 }}>
              {mutation.error?.response?.data?.message ||
                'El enlace es inválido o ha expirado. Por favor, solicita uno nuevo.'}
            </Alert>
          )}

          {/* Info Alert */}
          <Alert severity="info" sx={{ marginBottom: 3, borderRadius: 1 }}>
            <Typography variant="body2">
              Crea una contraseña segura con al menos 8 caracteres, incluyendo mayúscula, minúscula y número.
            </Typography>
          </Alert>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Nueva Contraseña */}
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'La contraseña es obligatoria',
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
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                  sx={{ marginBottom: 2.5 }}
                  disabled={mutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={mutation.isPending}
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

            {/* Confirmar Contraseña */}
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Confirma tu contraseña',
                validate: (value) =>
                  value === password || 'Las contraseñas no coinciden',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  sx={{ marginBottom: 3 }}
                  disabled={mutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          disabled={mutation.isPending}
                          size="small"
                        >
                          {showConfirmPassword ? (
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

            {/* Requisitos de contraseña */}
            <Box
              sx={{
                backgroundColor: '#F8FAFC',
                padding: 2,
                borderRadius: 1,
                marginBottom: 3,
                border: '1px solid #E5E7EB',
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 1 }}
              >
                Requisitos de contraseña:
              </Typography>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2, color: '#6B7280' }}>
                <Typography
                  variant="caption"
                  component="li"
                  sx={{
                    display: 'block',
                    marginBottom: 0.5,
                    color: password?.length >= 8 ? '#059669' : '#6B7280',
                  }}
                >
                  {password?.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
                </Typography>
                <Typography
                  variant="caption"
                  component="li"
                  sx={{
                    display: 'block',
                    marginBottom: 0.5,
                    color: /[A-Z]/.test(password) ? '#059669' : '#6B7280',
                  }}
                >
                  {/[A-Z]/.test(password) ? '✓' : '○'} Una letra mayúscula
                </Typography>
                <Typography
                  variant="caption"
                  component="li"
                  sx={{
                    display: 'block',
                    marginBottom: 0.5,
                    color: /[a-z]/.test(password) ? '#059669' : '#6B7280',
                  }}
                >
                  {/[a-z]/.test(password) ? '✓' : '○'} Una letra minúscula
                </Typography>
                <Typography
                  variant="caption"
                  component="li"
                  sx={{
                    display: 'block',
                    color: /\d/.test(password) ? '#059669' : '#6B7280',
                  }}
                >
                  {/\d/.test(password) ? '✓' : '○'} Un número
                </Typography>
              </Box>
            </Box>

            {/* Submit Button */}
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
                  <LockResetIcon />
                )
              }
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 1,
              }}
            >
              {mutation.isPending ? 'Actualizando...' : 'Establecer Contraseña'}
            </Button>
          </Box>

          {/* Info adicional */}
          <Box sx={{ marginTop: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Si el enlace ha expirado, puedes solicitar uno nuevo en la página de recuperación.
            </Typography>
          </Box>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
          <Typography variant="caption" sx={{ color: '#FFFFFF', opacity: 0.8 }}>
            © 2025 MiVet. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
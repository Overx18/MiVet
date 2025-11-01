import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import apiClient from '../../api/axios';

const registerUser = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success(data.message || '¡Registro exitoso! Inicia sesión.');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Ocurrió un error al registrarse.'
      );
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    mutation.mutate(registerData);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#1E40AF', mb: 0.5 }}
            >
              MiVet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crear una cuenta
            </Typography>
          </Box>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {mutation.error?.response?.data?.message ||
                'Ocurrió un error al registrarse.'}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="firstName"
                control={control}
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre"
                    fullWidth
                    size="small"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    autoComplete="given-name"
                    sx={{ mb: 2 }}
                    disabled={mutation.isPending}
                  />
                )}
              />
              
              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: 'El apellido es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apellido"
                    fullWidth
                    size="small"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    autoComplete="family-name"
                    sx={{ mb: 2 }}
                    disabled={mutation.isPending}
                  />
                )}
              />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un email válido',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Correo electrónico"
                  type="email"
                  fullWidth
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  sx={{ mb: 2 }}
                  disabled={mutation.isPending}
                />
              )}
            />

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
                  label="Teléfono (opcional)"
                  type="tel"
                  fullWidth
                  size="small"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  autoComplete="tel"
                  sx={{ mb: 2 }}
                  disabled={mutation.isPending}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe contener mayúscula, minúscula y número',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                  sx={{ mb: 2 }}
                  disabled={mutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          size="small"
                          disabled={mutation.isPending}
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
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  sx={{ mb: 2 }}
                  disabled={mutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          edge="end"
                          size="small"
                          disabled={mutation.isPending}
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={mutation.isPending}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PersonAddIcon />
                )
              }
              sx={{
                mt: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.2,
              }}
            >
              {mutation.isPending ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            ¿Ya tienes cuenta?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: '#1E40AF',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Inicia sesión
            </Link>
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              my: 2,
            }}
          >
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E7EB' }} />
            <Typography variant="caption" color="text.secondary">
              o
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E7EB' }} />
          </Box>

          <Alert severity="info" sx={{ borderRadius: 1, p: 0.5 }}>
            <Typography variant="caption">
              Al registrarte aceptas nuestros{' '}
              <Link
                href="#"
                sx={{
                  color: '#1E40AF',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Términos y Condiciones
              </Link>{' '}
              y{' '}
              <Link
                href="#"
                sx={{
                  color: '#1E40AF',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Política de Privacidad
              </Link>
            </Typography>
          </Alert>
        </Card>

        <Typography
          variant="caption"
          align="center"
          sx={{
            display: 'block',
            mt: 2,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          © 2025 MiVet. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}

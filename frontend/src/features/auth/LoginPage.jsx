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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const loginUser = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión.');
    },
  });

  const onSubmit = (credentials) => mutation.mutate(credentials);
  const togglePassword = () => setShowPassword((prev) => !prev);

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
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: '#1E40AF', mb: 0.5 }}
            >
              MiVet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Sistema de Gestión Veterinaria
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inicia sesión para continuar
            </Typography>
          </Box>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {mutation.error?.response?.data?.message ||
                'Error al iniciar sesión.'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
              name="password"
              control={control}
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
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
                  autoComplete="current-password"
                  disabled={mutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePassword}
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

            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{
                  fontSize: '0.8rem',
                  color: '#1E40AF',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={mutation.isPending}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
              sx={{
                mt: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.2,
              }}
            >
              {mutation.isPending ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            ¿No tienes cuenta?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: '#1E40AF',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Regístrate
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
              📌 Demo: demo@mivet.com | Demo123
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

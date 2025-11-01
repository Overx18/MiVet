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
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import apiClient from '../../api/axios';

// Función para solicitar recuperación de contraseña
const requestPasswordReset = async (email) => {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success(data.message || 'Enlace de recuperación enviado a tu email');
      setSentEmail(email);
      setEmailSent(true);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'Ocurrió un error al procesar tu solicitud.'
      );
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data.email);
  };

  const handleReset = () => {
    setEmailSent(false);
    setSentEmail('');
  };

  if (emailSent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
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
              <EmailIcon sx={{ fontSize: 40, color: '#059669' }} />
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
              Revisa tu correo
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ marginBottom: 3, lineHeight: 1.6 }}
            >
              Hemos enviado un enlace para recuperar tu contraseña a:
            </Typography>

            {/* Email mostrado */}
            <Alert severity="info" sx={{ marginBottom: 3, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E40AF' }}>
                {sentEmail}
              </Typography>
            </Alert>

            {/* Pasos a seguir */}
            <Box
              sx={{
                backgroundColor: '#F8FAFC',
                padding: 2.5,
                borderRadius: 1,
                marginBottom: 3,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, marginBottom: 1.5, color: '#1F2937' }}
              >
                Próximos pasos:
              </Typography>
              <Box component="ol" sx={{ marginLeft: 2, color: '#6B7280' }}>
                <Typography variant="body2" component="li" sx={{ marginBottom: 0.75 }}>
                  Abre tu correo electrónico
                </Typography>
                <Typography variant="body2" component="li" sx={{ marginBottom: 0.75 }}>
                  Haz clic en el enlace de recuperación
                </Typography>
                <Typography variant="body2" component="li" sx={{ marginBottom: 0.75 }}>
                  Crea una nueva contraseña
                </Typography>
                <Typography variant="body2" component="li">
                  Inicia sesión con tu nueva contraseña
                </Typography>
              </Box>
            </Box>

            {/* Nota sobre validez */}
            <Alert severity="warning" sx={{ marginBottom: 3, borderRadius: 1 }}>
              <Typography variant="caption">
                ⏱️ El enlace expira en 24 horas por razones de seguridad.
              </Typography>
            </Alert>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Ir a Iniciar Sesión
              </Button>
              <Button
                onClick={handleReset}
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Enviar de Nuevo
              </Button>
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
              <LockIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
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
              Recuperar Contraseña
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: '0.95rem' }}>
              Te ayudaremos a recuperar acceso a tu cuenta
            </Typography>
          </Box>

          {/* Alerta de Error */}
          {mutation.isError && (
            <Alert severity="error" sx={{ marginBottom: 3, borderRadius: 1 }}>
              {mutation.error?.response?.data?.message ||
                'Ocurrió un error al procesar tu solicitud.'}
            </Alert>
          )}

          {/* Descripción */}
          <Alert severity="info" sx={{ marginBottom: 3, borderRadius: 1 }}>
            <Typography variant="body2">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
            </Typography>
          </Alert>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
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
                  label="Correo Electrónico"
                  type="email"
                  fullWidth
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  sx={{ marginBottom: 3 }}
                  disabled={mutation.isPending}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#6B7280', marginRight: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

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
                  <LockIcon />
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
              {mutation.isPending ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </Box>

          {/* Back to Login Link */}
          <Box sx={{ marginTop: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  textDecoration: 'none',
                  color: '#1E40AF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
                Volver a Iniciar Sesión
              </Link>
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginY: 3 }}>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <Typography variant="caption" color="textSecondary">
              O
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </Box>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              ¿No tienes cuenta?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  textDecoration: 'none',
                  color: '#1E40AF',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Regístrate aquí
              </Link>
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
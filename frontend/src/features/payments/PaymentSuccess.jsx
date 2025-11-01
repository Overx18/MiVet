import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Card,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  EventAvailable as EventAvailableIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const toastShownRef = useRef(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('redirect_status');

    // Comprueba el estado Y si el toast ya se mostró
    if (status === 'succeeded' && !toastShownRef.current) {
      toastShownRef.current = true; // Marca el toast como mostrado
      toast.success('✓ Pago realizado correctamente');

      // Redirigir después de 3 segundos
      redirectTimerRef.current = setTimeout(() => {
        navigate('/appointments/calendar');
      }, 3000);
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [location, navigate]);

  const params = new URLSearchParams(location.search);
  const status = params.get('redirect_status');
  const isSuccess = status === 'succeeded';

  return (
    <Container maxWidth="md" sx={{ paddingY: 4, display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Box sx={{ width: '100%' }}>
        {/* Stepper */}
        <Box sx={{ marginBottom: 4 }}>
          <Stepper activeStep={2} sx={{ backgroundColor: '#F8FAFC', padding: 2, borderRadius: 1 }}>
            <Step completed>
              <StepLabel>Agendar</StepLabel>
            </Step>
            <Step completed>
              <StepLabel>Revisar</StepLabel>
            </Step>
            <Step completed>
              <StepLabel>Pagar</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {isSuccess ? (
          <>
            {/* Success Card */}
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                marginBottom: 3,
              }}
            >
              {/* Header Success */}
              <Box
                sx={{
                  padding: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 64,
                    marginBottom: 2,
                    animation: 'bounce 0.6s ease-in-out',
                    '@keyframes bounce': {
                      '0%, 100%': {
                        transform: 'translateY(0)',
                      },
                      '50%': {
                        transform: 'translateY(-10px)',
                      },
                    },
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    marginBottom: 1,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  ¡Pago Exitoso!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Tu cita ha sido confirmada y pagada correctamente
                </Typography>
              </Box>

              {/* Contenido */}
              <Box sx={{ padding: 4 }}>
                {/* Mensaje Principal */}
                <Alert severity="success" sx={{ marginBottom: 3, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>✓ Confirmado:</strong> Tu pago fue procesado exitosamente. Recibirás
                    un correo de confirmación con los detalles de tu cita.
                  </Typography>
                </Alert>

                {/* Información de Confirmación */}
                <Box
                  sx={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBFBEE',
                    borderRadius: 1,
                    padding: 3,
                    marginBottom: 3,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#047857',
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <EventAvailableIcon sx={{ fontSize: 20 }} />
                    Próximos Pasos
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 1,
                          border: '1px solid #D1FAE5',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#059669',
                            display: 'block',
                            marginBottom: 1,
                          }}
                        >
                          📧 Correo de Confirmación
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Revisa tu correo electrónico para los detalles de tu cita.
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 1,
                          border: '1px solid #D1FAE5',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#059669',
                            display: 'block',
                            marginBottom: 1,
                          }}
                        >
                          📱 Recordatorio
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Recibirás un SMS 24 horas antes de tu cita.
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 1,
                          border: '1px solid #D1FAE5',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#059669',
                            display: 'block',
                            marginBottom: 1,
                          }}
                        >
                          ⏰ Llega a Tiempo
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Recomendamos llegar 15 minutos antes.
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 1,
                          border: '1px solid #D1FAE5',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#059669',
                            display: 'block',
                            marginBottom: 1,
                          }}
                        >
                          ❓ ¿Preguntas?
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Contacta con nuestro soporte.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Detalles de Transacción */}
                <Box
                  sx={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E5E7EB',
                    borderRadius: 1,
                    padding: 2,
                    marginBottom: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Detalles de la Transacción
                  </Typography>

                  <Box sx={{ marginTop: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Número de Transacción:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: '#1F2937',
                        }}
                      >
                        TXN-{Date.now()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="textSecondary">
                        Método de Pago:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#1F2937' }}>
                        Tarjeta de Crédito (Stripe)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Progress Redirect */}
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                padding: 2,
                marginBottom: 3,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 1 }}>
                Redirigiendo a tu calendario...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#059669',
                    borderRadius: 1,
                  },
                }}
              />
            </Card>

            {/* Action Buttons */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/appointments/calendar')}
                  startIcon={<EventAvailableIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px',
                  }}
                >
                  Ver Mis Citas
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  startIcon={<HomeIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px',
                  }}
                >
                  Volver al Inicio
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            {/* Error Card */}
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                marginBottom: 3,
              }}
            >
              <Box
                sx={{
                  padding: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: 'white',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    marginBottom: 1,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  ❌ Pago No Completado
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Algo salió mal durante el procesamiento del pago
                </Typography>
              </Box>

              <Box sx={{ padding: 4 }}>
                <Alert severity="error" sx={{ marginBottom: 3, borderRadius: 1 }}>
                  <Typography variant="body2">
                    Tu pago no fue procesado. Por favor, intenta nuevamente o contacta con
                    soporte si el problema persiste.
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={() => navigate('/appointments/new')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '12px',
                      }}
                    >
                      Reintentar Pago
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '12px',
                      }}
                    >
                      Volver al Inicio
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </>
        )}
      </Box>
    </Container>
  );
}
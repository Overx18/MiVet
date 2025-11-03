import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  Alert,
  Grid,
  Divider,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Chip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  LocalOffer as LocalOfferIcon,
  EventAvailable as EventAvailableIcon,
  Pets as PetsIcon,
  Person as PersonIcon,
  Lock as LockSecureIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PayAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer el clientSecret y los datos de la cita del estado de la navegación
  const { clientSecret, appointmentData } = location.state || {};

  // Si no hay clientSecret (ej. el usuario recarga la página o entra por URL),
  // lo redirigimos a la página de agendamiento para que inicie el flujo correctamente.
  if (!clientSecret || !appointmentData) {
    toast.error('Acceso no autorizado. Por favor, agenda una cita primero.');
    return <Navigate to="/appointments/new" replace />;
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1E40AF',
        colorBackground: '#FFFFFF',
        colorText: '#1F2937',
        colorDanger: '#DC2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  // Formatear fecha y hora desde appointmentData
  let formattedDate = '';
  let formattedTime = '';

  try {
    const appointmentDate = new Date(appointmentData.dateTime);
    if (!isNaN(appointmentDate.getTime())) {
      formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  // Limpieza de datos (asegura que no haya undefined o strings)
  const cleanAppointmentData = {
    ...appointmentData,
    servicePrice: Number(appointmentData.servicePrice) || 0,
    igv: Number(appointmentData.igv) || 0,
    totalPrice:
      Number(appointmentData.totalPrice) ||
      (Number(appointmentData.servicePrice) + Number(appointmentData.igv || 0)),
    serviceDuration: appointmentData.serviceDuration || 'N/D',
    petSpecies: appointmentData.petSpecies || 'Especie desconocida',
    petName: appointmentData.petName || 'No disponible',
    ownerFirstName: appointmentData.ownerFirstName || '',
    ownerLastName: appointmentData.ownerLastName || '',
    professionalFirstName: appointmentData.professionalFirstName || '',
    professionalLastName: appointmentData.professionalLastName || '',
  };

  const formatCurrency = (num) =>
    num.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
  
  return (
    <Container maxWidth="xl" sx={{ paddingY: 1 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 1, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            marginBottom: 1,
          }}
        >
          <PaymentIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Completar Pago
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Paga tu cita veterinaria de forma segura
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ marginBottom: 4 }}>
        <Stepper activeStep={2} sx={{ backgroundColor: '#F8FAFC', padding: 2, borderRadius: 1 }}>
          <Step completed>
            <StepLabel>Agendar</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Revisar</StepLabel>
          </Step>
          <Step active>
            <StepLabel>Pagar</StepLabel>
          </Step>
        </Stepper>
      </Box>

      {/* Main Layout: Resumen + Formulario */}
      <Grid container spacing={1}>
        {/* Resumen de la Cita */}
        <Grid item xs={1} md={1}>
        <Card
          sx={{
            borderRadius: 1,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'sticky',
            maxWidth: 300, // 🔹 tamaño visual reducido
            top: 16,
          }}
        >
            {/* Header */}
            <Box
              sx={{
                padding: 3,
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                <EventAvailableIcon sx={{ color: '#1E40AF', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  Resumen de la Cita
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Verifica los detalles antes de pagar
              </Typography>
            </Box>

            {/* Contenido */}
            <Box sx={{ padding: 3 }}>
              {/* Fecha y Hora */}
              <Box sx={{ marginBottom: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                >
                  📅 Fecha y Hora
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, marginTop: 0.5, color: '#1F2937' }}
                >
                  {formattedDate}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                  {formattedTime}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Servicio */}
              <Box sx={{ marginBottom: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                  <LocalOfferIcon sx={{ color: '#7C3AED', fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Servicio
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, marginTop: 0.5, color: '#1F2937' }}
                >
                  {cleanAppointmentData.serviceName || 'Servicio no disponible'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Duración: {cleanAppointmentData.serviceDuration || 'x'} minutos
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Mascota */}
              <Box sx={{ marginBottom: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                  <PetsIcon sx={{ color: '#DC2626', fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Mascota
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, marginTop: 0.5, color: '#1F2937' }}
                >
                  {cleanAppointmentData.petName || 'Mascota no disponible'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {cleanAppointmentData.petSpecies || 'Especie desconocida'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Propietario */}
              <Box sx={{ marginBottom: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                  <PersonIcon sx={{ color: '#0F766E', fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Propietario
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, marginTop: 0.5, color: '#1F2937' }}
                >
                  {cleanAppointmentData.ownerFirstName} {cleanAppointmentData.ownerLastName}
                </Typography>
                {cleanAppointmentData.ownerPhone && (
                  <Typography variant="caption" color="textSecondary">
                    {cleanAppointmentData.ownerPhone}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Veterinario */}
              <Box sx={{ marginBottom: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                  <PersonIcon sx={{ color: '#7C3AED', fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Veterinario
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, marginTop: 0.5, color: '#1F2937' }}
                >
                  {cleanAppointmentData.professionalFirstName} {cleanAppointmentData.professionalLastName}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />
              
              {/* Desglose */}
              <Box sx={{ backgroundColor: '#F3F4F6', padding: 2, borderRadius: 1, marginTop: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: 1,
                  }}
                >
                  Desglose de Precio
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Servicio:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(cleanAppointmentData.servicePrice)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    IGV (18%):
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(cleanAppointmentData.igv)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Precio Total */}
              <Paper
                sx={{
                  padding: 2,
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 1,
                  marginBottom: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: '#1F2937',
                    }}
                  >
                    Total a Pagar
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#1E40AF',
                    }}
                  >
                    {formatCurrency(cleanAppointmentData.totalPrice)}
                  </Typography>
                </Box>
              </Paper>

              {/* Seguridad */}
              <Alert severity="info" sx={{ marginTop: 3, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockSecureIcon sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      🔒 Pago Seguro
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Procesado por Stripe. Tus datos están 100% protegidos.
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            </Box>
          </Card>
        </Grid>

        {/* Formulario Stripe */}
        <Grid item xs={1} md={1}>
          <Card
            sx={{
              borderRadius: 1,
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              maxWidth: 800, // 🔹 límite visual del ancho
            }}
          >
            {/* Header */}
            <Box
              sx={{
                padding: 3,
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                <PaymentIcon sx={{ color: '#1E40AF', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  Información de Pago
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Ingresa los detalles de tu tarjeta
              </Typography>
            </Box>

            {/* Contenido */}
            <Box sx={{ padding: 3 }}>
              {/* Alert de tarjeta de prueba */}
              <Alert severity="info" sx={{ marginBottom: 3, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>📝 Tarjeta de Prueba:</strong> Usa{' '}
                  <code
                    style={{
                      backgroundColor: '#F3F4F6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}
                  >
                    4242 4242 4242 4242
                  </code>{' '}
                  con cualquier fecha futura y CVC.
                </Typography>
              </Alert>

              {/* Formulario de pago */}
              <Elements options={stripeOptions} stripe={stripePromise}>
                <CheckoutForm appointmentId={cleanAppointmentData.petId} totalPrice={cleanAppointmentData.totalPrice}/>
              </Elements>
            </Box>
          </Card>

          {/* Términos */}
          <Alert severity="warning" sx={{ marginTop: 3, borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Al realizar este pago, aceptas nuestros{' '}
              <Typography
                component="span"
                sx={{
                  fontWeight: 600,
                  color: '#1E40AF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                términos y condiciones
              </Typography>
              . Tu cita será confirmada una vez completado el pago exitosamente.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Info Footer */}
      <Box sx={{ marginTop: 4, textAlign: 'center', paddingBottom: 2 }}>
        <Typography variant="caption" color="textSecondary">
          ¿Problemas con el pago?{' '}
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              color: '#1E40AF',
              cursor: 'pointer',
            }}
          >
            Contacta con soporte
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
}
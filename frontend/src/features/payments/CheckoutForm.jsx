import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export default function CheckoutForm({ appointmentId, totalPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Validar que los datos necesarios existan
  const isDataValid = appointmentId && totalPrice && totalPrice > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones iniciales
    if (!stripe || !elements) {
      const msg = 'El formulario de pago no está disponible. Recarga la página.';
      setErrorMessage(msg);
      toast.error(msg);
      console.error('❌ Stripe o Elements no disponibles');
      return;
    }

    if (!isDataValid) {
      const msg = 'Datos de cita inválidos. Por favor, intenta nuevamente.';
      setErrorMessage(msg);
      toast.error(msg);
      console.error('❌ appointmentId o totalPrice no válidos', {
        appointmentId,
        totalPrice,
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log('🔄 Iniciando confirmación de pago...');
      console.log('📦 Appointment ID:', appointmentId);
      console.log('💰 Total a pagar:', totalPrice);
      console.log('🔐 Stripe instance:', stripe ? '✓ Disponible' : '✗ No disponible');

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?redirect_status=succeeded&appointment_id=${appointmentId}`,
        },
        redirect: 'if_required', // Solo redirige si es necesario (3D Secure, etc.)
      });

      // Manejo de errores
      if (error) {
        console.error('❌ Error en Stripe:', error);

        let errorMsg = 'Ocurrió un error desconocido.';
        let errorCode = error.code || 'UNKNOWN';

        // Mapear tipos de error comunes
        if (error.type === 'card_error') {
          errorMsg = error.message || 'Error en la tarjeta. Verifica los datos.';
          errorCode = error.code;
        } else if (error.type === 'validation_error') {
          errorMsg = 'Error de validación. Por favor, completa todos los campos.';
        } else if (error.type === 'rate_limit_error') {
          errorMsg = 'Demasiados intentos. Por favor, intenta más tarde.';
        } else if (error.type === 'api_error') {
          errorMsg = 'Error del servidor Stripe. Por favor, intenta de nuevo.';
        } else if (error.type === 'authentication_error') {
          errorMsg =
            'Error de autenticación. Verifica tus datos de pago.';
        } else if (error.type === 'invalid_request_error') {
          errorMsg = 'Solicitud inválida. Por favor, intenta de nuevo.';
        }

        setErrorMessage(errorMsg);
        toast.error(`❌ ${errorMsg}`);

        console.warn('⚠️ Error Details:', {
          message: errorMsg,
          code: errorCode,
          type: error.type,
          param: error.param,
          charge: error.charge,
        });
      } else if (paymentIntent) {
        // Verificar estado del pago
        console.log('✅ Payment Intent Status:', paymentIntent.status);
        console.log('📋 Payment Intent ID:', paymentIntent.id);

        if (
          paymentIntent.status === 'succeeded' ||
          paymentIntent.status === 'requires_action'
        ) {
          setSuccessMessage('✓ Pago procesado correctamente.');
          toast.success('¡Pago completado exitosamente!');

          console.log('✅ Pago exitoso. Redirigiendo a página de éxito...');

          // Redirigir a página de éxito después de 1.5 segundos
          setTimeout(() => {
            navigate(
              `/payment-success?redirect_status=succeeded&appointment_id=${appointmentId}`,
              { replace: true }
            );
          }, 1500);
        } else {
          console.warn('⚠️ Payment status inesperado:', paymentIntent.status);
          setErrorMessage(`Estado de pago: ${paymentIntent.status}`);
          toast.error(`Estado inesperado: ${paymentIntent.status}`);
        }
      }
    } catch (err) {
      console.error('❌ Error inesperado en handleSubmit:', err);

      const errorMsg =
        err.message ||
        'Ocurrió un error inesperado al procesar el pago.';
      setErrorMessage(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar advertencia si los datos no son válidos
  const showDataWarning = !isDataValid;

  return (
    <Box
      component="form"
      id="payment-form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Data Validation Warning */}
      {showDataWarning && (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          sx={{
            borderRadius: 1,
            animation: 'slideIn 0.3s ease-in-out',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Typography variant="body2">
            <strong>⚠️ Error de datos:</strong> La información de la cita no es válida. Por
            favor, recarga la página.
          </Typography>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && !showDataWarning && (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          onClose={() => setErrorMessage(null)}
          sx={{
            borderRadius: 1,
            animation: 'slideIn 0.3s ease-in-out',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Typography variant="body2">
            <strong>❌ Error:</strong> {errorMessage}
          </Typography>
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            borderRadius: 1,
            animation: 'slideIn 0.3s ease-in-out',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Typography variant="body2">
            <strong>✓ Éxito:</strong> {successMessage}
          </Typography>
        </Alert>
      )}

      {/* Stripe Loading State */}
      {!stripe || !elements ? (
        <Paper
          sx={{
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 1,
            border: '1px solid #E5E7EB',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={40} sx={{ marginBottom: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Cargando formulario de pago seguro...
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Payment Element Container - CON MÁS ESPACIO */}
          <Paper
            sx={{
              padding: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 1,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              minHeight: '400px', // ← Espacio generoso para el formulario de Stripe
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PaymentIcon sx={{ color: '#1E40AF', fontSize: 20 }} />
                Detalles de Pago
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginTop: 0.5 }}
              >
                Ingresa tu información de tarjeta de forma segura
              </Typography>
            </Box>

            {/* Stripe Payment Element - CON FLEX GROW */}
            <Box
              sx={{
                flex: 1, // ← Ocupa todo el espacio disponible
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '& .StripeElement': {
                  boxSizing: 'border-box',
                  height: 'auto',
                  minHeight: '200px', // ← Altura mínima para que se expanda bien
                  padding: '16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  fontSize: '16px',
                  '&--focus': {
                    boxShadow: '0 1px 3px 0 #cce7ff',
                    borderColor: '#1E40AF',
                  },
                  '&--invalid': {
                    borderColor: '#DC2626',
                    boxShadow: '0 1px 3px 0 rgba(220, 38, 38, 0.1)',
                  },
                },
                marginTop: 2,
                marginBottom: 3,
              }}
            >
              <PaymentElement
                id="payment-element"
                options={{
                  layout: 'tabs',
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto',
                  },
                }}
              />
            </Box>

            {/* Info Text */}
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{
                display: 'block',
                marginTop: 'auto',
                paddingTop: 1,
                borderTop: '1px solid #F3F4F6',
              }}
            >
              🔒 Tu información está protegida por Stripe. No guardamos datos de tarjeta.
            </Typography>
          </Paper>

          {/* Submit Button */}
          <Button
            type="submit"
            id="submit"
            variant="contained"
            fullWidth
            disabled={isLoading || !stripe || !elements || showDataWarning}
            size="large"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PaymentIcon />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              padding: '14px 24px',
              fontSize: '1rem',
              backgroundColor: '#1E40AF',
              '&:hover:not(:disabled)': {
                backgroundColor: '#1E3A8A',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
              },
              '&:disabled': {
                backgroundColor: '#D1D5DB',
                color: '#9CA3AF',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <span id="button-text">
              {isLoading ? (
                <>
                  Procesando pago...
                </>
              ) : isDataValid ? (
                `Pagar ahora S/ ${Number(totalPrice).toFixed(2)}`
              ) : (
                'Datos inválidos'
              )}
            </span>
          </Button>

          {/* Support Note */}
          <Alert
            severity="info"
            icon={<WarningIcon />}
            sx={{ borderRadius: 1 }}
          >
            <Typography variant="body2">
              <strong>💡 Consejo:</strong> El pago normalmente se procesa en segundos. Si ves que
              tarda más, no cierres esta página.
            </Typography>
          </Alert>

          {/* Formas de Pago Soportadas */}
          <Paper
            sx={{
              padding: 2,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#6B7280',
                display: 'block',
                marginBottom: 1,
              }}
            >
              💳 Formas de Pago Aceptadas:
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Tarjetas de crédito/débito (Visa, Mastercard, American Express), Google Pay, Apple Pay y más.
            </Typography>
          </Paper>

        </>
      )}
    </Box>
  );
}
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeCheckoutForm = ({ saleId, onPaymentSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage('Stripe aún no ha cargado. Intenta de nuevo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    console.log('💳 Procesando pago para venta:', saleId);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pos?sale_success=true&sale_id=${saleId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('❌ Error en pago:', error.message);
        setErrorMessage(error.message);
        toast.error(`Error: ${error.message}`);
        setIsLoading(false);
      } else {
        console.log('✅ Pago procesado exitosamente');
        toast.success('¡Pago completado exitosamente!');
        onPaymentSuccess();
        onClose();
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      setErrorMessage('Error inesperado. Intenta de nuevo.');
      toast.error('Error inesperado al procesar el pago');
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Info de Seguridad */}
      <Alert
        severity="info"
        icon={<LockIcon />}
        sx={{ borderRadius: 1 }}
      >
        <Typography variant="body2">
          <strong>🔒 Seguro:</strong> Tu información de pago está protegida por Stripe con encriptación SSL.
        </Typography>
      </Alert>

      {/* Stripe Payment Element */}
      <Paper
        sx={{
          padding: 2,
          border: '1px solid #E5E7EB',
          borderRadius: 1,
          backgroundColor: '#FFFFFF',
        }}
      >
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </Paper>

      {/* Error Message */}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {errorMessage}
          </Typography>
        </Alert>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
          <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', fontWeight: 600 }}>
            Procesando pago... Por favor espera
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          startIcon={<CloseIcon />}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#6B7280',
            borderColor: '#D1D5DB',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              borderColor: '#6B7280',
            },
            '&:disabled': {
              color: '#9CA3AF',
              borderColor: '#D1D5DB',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          variant="contained"
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CreditCardIcon />
            )
          }
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            padding: '12px 24px',
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
          {isLoading ? 'Procesando Pago...' : 'Pagar Ahora'}
        </Button>
      </Box>
    </Box>
  );
};

export default function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  saleId,
  onPaymentSuccess,
}) {
  if (!clientSecret || !saleId) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid #E5E7EB',
        },
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: '#1F2937',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CreditCardIcon sx={{ color: '#1E40AF', fontSize: 24 }} />
        </Box>
        Completar Pago
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ paddingTop: 3, paddingBottom: 2 }}>
        {/* Sale Info */}
        <Paper
          sx={{
            padding: 2,
            marginBottom: 3,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#1E40AF' }}>
                Número de Venta
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                #{saleId}
              </Typography>
            </Box>
            <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981' }} />
          </Box>
        </Paper>

        {/* Stripe Elements */}
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#1E40AF',
                  colorText: '#1F2937',
                  colorDanger: '#DC2626',
                  borderRadius: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                },
              },
            }}
          >
            <StripeCheckoutForm
              saleId={saleId}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Cargando formulario de pago...
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Footer Info */}
      <Box
        sx={{
          paddingX: 3,
          paddingBottom: 2,
          backgroundColor: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LockIcon sx={{ fontSize: 16 }} />
          <strong>Pagos seguros con Stripe</strong> • Certificación PCI DSS Nivel 1
        </Typography>
      </Box>

      {/* Debug Info (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <Box
          sx={{
            paddingX: 3,
            paddingBottom: 2,
            backgroundColor: '#FEF3C7',
            borderTop: '1px solid #FBBF24',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: '#92400E',
            }}
          >
            <strong>🔧 Debug:</strong> SaleID: {saleId} • ClientSecret: {clientSecret?.substring(0, 10)}...
          </Typography>
        </Box>
      )}
    </Dialog>
  );
}
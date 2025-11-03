import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  CircularProgress,
  Paper,
  Grid,
  Alert,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditCard as CreditCardIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const TAX_RATE = 0.18; // 18% IVA

const processSaleApi = ({ saleData, token }) =>
  apiClient.post('/sales', saleData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default function SaleCart({
  cart,
  clients,
  selectedClient,
  onSelectClient,
  onUpdateQuantity,
  onClearCart,
  onProcessSale,
  isClientsLoading,
}) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  // Calcular totales
  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = total * TAX_RATE;
    const sub = total * (1 - TAX_RATE);
    return { subtotal: sub, taxAmount: tax, totalAmount: total };
  }, [cart]);

  const saleMutation = useMutation({
    mutationFn: processSaleApi,
    onSuccess: (response, variables) => {
      if (variables.saleData.paymentMethod === 'Efectivo') {
        toast.success('✅ Venta en efectivo registrada correctamente');
        onClearCart();
      } else {
        // Tarjeta
        toast.success('💳 Venta registrada. Procediendo al pago...');
        onProcessSale({
          showModal: true,
          clientSecret: response.data.clientSecret,
          saleId: response.data.saleId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Error al procesar la venta.';
      console.error('❌ Error:', errorMsg);
      toast.error(errorMsg);
    },
  });

  const handleProcessSale = () => {
    console.log('📤 Procesando venta:', {
      cliente: selectedClient?.id,
      items: cart.length,
      total: totalAmount,
      metodo: paymentMethod,
    });

    if (!selectedClient) {
      toast.error('⚠️ Debes seleccionar un cliente para continuar');
      return;
    }
    if (cart.length === 0) {
      toast.error('⚠️ El carrito está vacío');
      return;
    }

    const saleData = {
      clientId: selectedClient.id,
      items: cart.map((item) => ({
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod,
      subtotal,
      taxAmount,
      totalAmount,
    };

    saleMutation.mutate({ saleData, token });
  };

  const handleRemoveItem = (item) => {
    console.log('🗑️ Removiendo del carrito:', item.name);
    onUpdateQuantity(item, 0);
  };

  const handleQuantityChange = (item, newQuantity) => {
    console.log('🔄 Actualizando cantidad:', item.name, newQuantity);
    onUpdateQuantity(item, newQuantity);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 3,
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginBottom: 1,
        }}
      >
        <ShoppingCartIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1F2937',
            }}
          >
            Carrito de Venta
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Selector de Cliente */}
      <FormControl fullWidth size="small">
        <InputLabel sx={{ '&.Mui-focused': { color: '#1E40AF' } }}>
          Seleccionar Cliente *
        </InputLabel>
        <Select
          value={selectedClient?.id || ''}
          onChange={(e) => {
            const client = clients.find((c) => c.id === e.target.value);
            onSelectClient(client);
          }}
          label="Seleccionar Cliente *"
          disabled={isClientsLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#1E40AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1E40AF',
              },
            },
          }}
        >
          <MenuItem value="">-- Selecciona un cliente --</MenuItem>
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.firstName} {client.lastName}
              {client.email && ` (${client.email})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Info Cliente Seleccionado */}
      {selectedClient && (
        <Paper
          sx={{
            padding: 2,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#1E40AF' }}>
            ✓ Cliente Seleccionado
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937', mt: 0.5 }}>
            {selectedClient.firstName} {selectedClient.lastName}
          </Typography>
          {selectedClient.email && (
            <Typography variant="caption" color="textSecondary">
              {selectedClient.email}
            </Typography>
          )}
        </Paper>
      )}

      {/* Items en el Carrito */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #E5E7EB',
          borderRadius: 1,
          backgroundColor: '#F9FAFB',
          padding: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F3F4F6',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D1D5DB',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: '#9CA3AF',
            },
          },
        }}
      >
        {cart.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '150px',
              gap: 1,
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
              El carrito está vacío
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Selecciona productos o servicios para comenzar
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {cart.map((item) => (
              <ListItem
                key={`${item.type}-${item.id}`}
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 1,
                  border: '1px solid #E5E7EB',
                  paddingY: 1,
                  paddingX: 1.5,
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                  marginBottom: 0.5,
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#1F2937',
                      }}
                    >
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      S/ {Number(item.price).toFixed(2)} × {item.quantity} = S/{' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title="Reducir cantidad">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                        sx={{
                          color: '#6B7280',
                          '&:hover': {
                            backgroundColor: '#E5E7EB',
                            color: '#1F2937',
                          },
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Box
                      sx={{
                        minWidth: '30px',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#1F2937',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.quantity}
                    </Box>

                    <Tooltip title="Aumentar cantidad">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                        sx={{
                          color: '#6B7280',
                          '&:hover': {
                            backgroundColor: '#E5E7EB',
                            color: '#1F2937',
                          },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar del carrito">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveItem(item)}
                        sx={{
                          color: '#DC2626',
                          '&:hover': {
                            backgroundColor: '#FEE2E2',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Totales */}
      <Paper
        sx={{
          padding: 2,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E5E7EB',
          borderRadius: 1,
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Subtotal:
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
              S/ {subtotal.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              IGV (18%):
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
              S/ {taxAmount.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={6}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                fontSize: '1rem',
              }}
            >
              Total:
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1E40AF',
                fontSize: '1.25rem',
              }}
            >
              S/ {totalAmount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Método de Pago */}
      <FormControl fullWidth size="small">
        <InputLabel sx={{ '&.Mui-focused': { color: '#1E40AF' } }}>
          Método de Pago
        </InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => {
            console.log('💳 Método de pago cambiado a:', e.target.value);
            setPaymentMethod(e.target.value);
          }}
          label="Método de Pago"
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#1E40AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1E40AF',
              },
            },
          }}
        >
          <MenuItem value="Efectivo">
            <AttachMoneyIcon sx={{ mr: 1, fontSize: 18 }} />
            Efectivo
          </MenuItem>
          <MenuItem value="Tarjeta">
            <CreditCardIcon sx={{ mr: 1, fontSize: 18 }} />
            Tarjeta de Crédito
          </MenuItem>
        </Select>
      </FormControl>

      {/* Info Método de Pago */}
      {paymentMethod === 'Efectivo' && (
        <Alert
          severity="info"
          icon={<AttachMoneyIcon />}
          sx={{ borderRadius: 1 }}
        >
          <Typography variant="body2">
            <strong>Efectivo:</strong> La venta se registrará inmediatamente.
          </Typography>
        </Alert>
      )}

      {paymentMethod === 'Tarjeta' && (
        <Alert
          severity="info"
          icon={<CreditCardIcon />}
          sx={{ borderRadius: 1 }}
        >
          <Typography variant="body2">
            <strong>Tarjeta:</strong> Se te redireccionará a Stripe para completar el pago.
          </Typography>
        </Alert>
      )}

      {/* Botones de Acción */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            onClick={handleProcessSale}
            disabled={
              saleMutation.isPending || cart.length === 0 || !selectedClient
            }
            variant="contained"
            fullWidth
            startIcon={
              saleMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#10B981',
              '&:hover:not(:disabled)': {
                backgroundColor: '#059669',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              },
              '&:disabled': {
                backgroundColor: '#D1D5DB',
                color: '#9CA3AF',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {saleMutation.isPending ? 'Procesando...' : 'Procesar Venta'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            onClick={onClearCart}
            disabled={cart.length === 0 || saleMutation.isPending}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              padding: '12px 24px',
              fontSize: '1rem',
              color: '#DC2626',
              borderColor: '#FCA5A5',
              '&:hover:not(:disabled)': {
                backgroundColor: '#FEE2E2',
                borderColor: '#DC2626',
              },
              '&:disabled': {
                color: '#9CA3AF',
                borderColor: '#D1D5DB',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Limpiar Carrito
          </Button>
        </Grid>
      </Grid>

      {/* Debug Info (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <Paper
          sx={{
            padding: 1.5,
            backgroundColor: '#FEF3C7',
            border: '1px solid #FBBF24',
            borderRadius: 1,
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
            <strong>🔧 Debug:</strong> Items: {cart.length} • Client: {selectedClient?.id || 'none'} • Total:{' '}
            {totalAmount.toFixed(2)} • Payment: {paymentMethod} • Pending: {saleMutation.isPending ? '✓' : '✗'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
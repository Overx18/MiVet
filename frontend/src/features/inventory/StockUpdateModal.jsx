import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Función de API
const adjustStock = ({ productId, data, token }) =>
  apiClient.patch(`/products/${productId}/stock`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default function StockUpdateModal({ isOpen, onClose, product }) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      type: 'Entrada',
      quantity: '',
      reason: '',
    },
  });

  // Observar valores
  const moveType = watch('type');
  const quantity = watch('quantity');

  const mutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      toast.success('✅ Stock actualizado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
      reset();
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Error al actualizar el stock.';
      console.error('❌ Error:', errorMsg);
      toast.error(`❌ ${errorMsg}`);
    },
  });

  const onSubmit = (data) => {
    console.log('📤 Ajustando stock:', {
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
    });

    const quantityChange = data.type === 'Entrada' ? Number(data.quantity) : -Number(data.quantity);
    
    mutation.mutate({
      productId: product.id,
      data: {
        quantityChange,
        type: 'Ajuste',
        reason: data.reason,
      },
      token,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!product) return null;

  // Calcular stock después del ajuste
  const newStock = product.quantity + (moveType === 'Entrada' ? Number(quantity || 0) : -Number(quantity || 0));

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {moveType === 'Entrada' ? (
            <ArrowUpwardIcon sx={{ color: '#059669', fontWeight: 700 }} />
          ) : (
            <ArrowDownwardIcon sx={{ color: '#DC2626', fontWeight: 700 }} />
          )}
        </Box>
        Ajustar Stock: {product.name}
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ paddingTop: 3 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información Actual */}
          <Paper
            sx={{
              padding: 2,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 1,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Stock Actual:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E40AF', marginTop: 0.5 }}>
                  {product.quantity} unidades
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Precio Unitario:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E40AF', marginTop: 0.5 }}>
                  S/ {Number(product.price || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Alert Info */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>💡 Nota:</strong> Registra el movimiento de stock especificando la cantidad y el motivo.
            </Typography>
          </Alert>

          {/* Tipo de Movimiento */}
          <Controller
            name="type"
            control={control}
            rules={{ required: 'El tipo de movimiento es obligatorio' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel sx={{ '&.Mui-focused': { color: '#1E40AF' } }}>
                  Tipo de Movimiento *
                </InputLabel>
                <Select
                  {...field}
                  label="Tipo de Movimiento *"
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
                  <MenuItem value="Entrada">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowUpwardIcon sx={{ color: '#059669' }} />
                      Entrada (Añadir al stock)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Salida">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowDownwardIcon sx={{ color: '#DC2626' }} />
                      Salida (Quitar del stock)
                    </Box>
                  </MenuItem>
                </Select>
                {errors.type && (
                  <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5, display: 'block' }}>
                    {errors.type.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Cantidad */}
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: 'La cantidad es obligatoria',
              validate: {
                positive: (value) => value > 0 || 'La cantidad debe ser mayor a 0',
                isNumber: (value) => !isNaN(value) || 'Debe ser un número válido',
                enoughStock: (value) =>
                  moveType !== 'Salida' ||
                  Number(value) <= product.quantity ||
                  `No hay suficiente stock. Máximo: ${product.quantity}`,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cantidad *"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.quantity}
                helperText={errors.quantity?.message || `Ingresa la cantidad a ${moveType === 'Entrada' ? 'agregar' : 'quitar'}`}
                placeholder="Ej: 10"
                inputProps={{
                  min: '1',
                  step: '1',
                }}
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
              />
            )}
          />

          {/* Motivo del Ajuste */}
          <Controller
            name="reason"
            control={control}
            rules={{
              required: 'El motivo del ajuste es obligatorio',
              minLength: {
                value: 3,
                message: 'El motivo debe tener al menos 3 caracteres',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Motivo del Ajuste *"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                error={!!errors.reason}
                helperText={errors.reason?.message || 'Explica por qué se realiza este ajuste'}
                placeholder="Ej: Reposición de inventario, devolución de cliente, pérdida, etc."
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
              />
            )}
          />

          {/* Resumen de Cambios */}
          {quantity && (
            <Paper
              sx={{
                padding: 2,
                backgroundColor: moveType === 'Entrada' ? '#F0FDF4' : '#FEE2E2',
                border: moveType === 'Entrada' ? '1px solid #BBEF63' : '1px solid #FECACA',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: moveType === 'Entrada' ? '#059669' : '#DC2626',
                  display: 'block',
                  marginBottom: 1,
                }}
              >
                📊 Resumen de Cambios
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Stock Actual:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                    {product.quantity} unidades
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    {moveType === 'Entrada' ? 'Sumará:' : 'Restará:'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: moveType === 'Entrada' ? '#059669' : '#DC2626',
                    }}
                  >
                    {moveType === 'Entrada' ? '+' : '-'} {quantity}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ my: 1, borderTop: '1px solid currentColor', opacity: 0.2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                      Stock Resultante:
                    </Typography>
                    <Chip
                      label={`${newStock} unidades`}
                      color={newStock < 5 ? 'error' : newStock < 10 ? 'warning' : 'success'}
                      variant="filled"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          padding: 2,
          gap: 1,
          backgroundColor: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CloseIcon />}
          disabled={mutation.isPending}
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
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          startIcon={
            mutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckIcon />
            )
          }
          disabled={mutation.isPending || !isValid}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
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
          {mutation.isPending ? 'Guardando...' : 'Confirmar Ajuste'}
        </Button>
      </DialogActions>

      {/* Debug Info (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <Box
          sx={{
            padding: 2,
            backgroundColor: '#FEF3C7',
            border: '1px solid #FBBF24',
            borderRadius: 1,
            marginX: 2,
            marginBottom: 2,
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
            <strong>🔧 Debug:</strong> Type: {moveType} • Qty: {quantity} • NewStock: {newStock} • Valid: {isValid ? '✓' : '✗'}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
}
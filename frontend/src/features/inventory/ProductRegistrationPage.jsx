import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Función de API
const addProduct = ({ productData, token }) =>
  apiClient.post('/products', productData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default function ProductRegistrationPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      quantity: '',
      price: '',
      provider: '',
      expiryDate: '',
    },
  });

  // Observar valores para el resumen
  const quantity = watch('quantity');
  const price = watch('price');
  const expiryDate = watch('expiryDate');

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: (response) => {
      console.log('✅ Producto registrado:', response.data);
      setSuccessMessage('✓ Producto registrado exitosamente.');
      toast.success('¡Producto agregado al inventario!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.message || 'Error al registrar el producto.';
      console.error('❌ Error:', errorMsg);
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data) => {
    console.log('📤 Enviando datos del producto:', data);

    // Convertir valores a números
    const productData = {
      ...data,
      quantity: Number(data.quantity),
      price: Number(data.price),
    };

    mutation.mutate({ productData, token });
  };

  // Calcular fecha mínima (hoy)
  const minDate = new Date().toISOString().split('T')[0];

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="sm" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            marginBottom: 1,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Nuevo Producto
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Agrega productos al inventario de forma rápida
        </Typography>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          onClose={() => setSuccessMessage(null)}
          sx={{
            marginBottom: 3,
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
            <strong>{successMessage}</strong> El producto está disponible en el inventario.
          </Typography>
        </Alert>
      )}

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header del Card */}
        <Box
          sx={{
            padding: 3,
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
            <AddIcon sx={{ color: '#1E40AF', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Información del Producto
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            Completa los datos esenciales del producto
          </Typography>
        </Box>

        {/* Form Content */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ padding: 3 }}>
          {/* Info Alert */}
          <Alert
            severity="info"
            icon={<InfoIcon />}
            sx={{ marginBottom: 3, borderRadius: 1 }}
          >
            <Typography variant="body2">
              <strong>💡 Nota:</strong> Solo los campos marcados con * son obligatorios.
              Mantén el formulario simple y directo.
            </Typography>
          </Alert>

          {/* Nombre del Producto */}
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'El nombre del producto es obligatorio',
              minLength: {
                value: 3,
                message: 'El nombre debe tener al menos 3 caracteres',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Producto *"
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Alimento para Perros"
                sx={{
                  marginBottom: 3,
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

          {/* Descripción */}
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: 'La descripción no debe exceder 500 caracteres',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción (Opcional)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                error={!!errors.description}
                helperText={errors.description?.message || 'Detalles adicionales del producto'}
                placeholder="Ej: Alimento premium para perros adultos, con carne de pollo..."
                sx={{
                  marginBottom: 3,
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

          <Divider sx={{ my: 2 }} />

          {/* Grid para Cantidad y Precio */}
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            {/* Cantidad */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: 'La cantidad es obligatoria',
                  validate: {
                    positive: (value) =>
                      value > 0 || 'La cantidad debe ser mayor a 0',
                    isNumber: (value) =>
                      !isNaN(value) || 'Debe ser un número válido',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cantidad (Stock) *"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    placeholder="Ej: 50"
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
            </Grid>

            {/* Precio */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'El precio es obligatorio',
                  validate: {
                    positive: (value) =>
                      value > 0 || 'El precio debe ser mayor a 0',
                    isNumber: (value) =>
                      !isNaN(value) || 'Debe ser un número válido',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio de Venta (S/.) *"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    placeholder="Ej: 49.99"
                    inputProps={{
                      min: '0.01',
                      step: '0.01',
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
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Fecha de Caducidad */}
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de Caducidad (Opcional)"
                type="date"
                fullWidth
                variant="outlined"
                error={!!errors.expiryDate}
                helperText={errors.expiryDate?.message || 'Formato: YYYY-MM-DD'}
                inputProps={{
                  min: minDate,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  marginBottom: 3,
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

          {/* Proveedor (Opcional) */}
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Proveedor (Opcional)"
                fullWidth
                variant="outlined"
                placeholder="Ej: Distribuidora XYZ"
                sx={{
                  marginBottom: 3,
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

          {/* Summary Card */}
          <Paper
            sx={{
              padding: 3,
              marginBottom: 3,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#1E40AF',
                display: 'block',
                marginBottom: 2,
              }}
            >
              📊 Resumen del Producto
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Cantidad:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1F2937' }}
                >
                  {quantity || '0'} unidades
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Precio Unitario:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1F2937' }}
                >
                  S/ {Number(price || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Caducidad:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: expiryDate ? '#059669' : '#6B7280',
                  }}
                >
                  {formatDate(expiryDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Stock Total:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1F2937' }}
                >
                  S/ {(Number(quantity || 0) * Number(price || 0)).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: '#1F2937' }}
                  >
                    Valor Total del Inventario:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#1E40AF',
                      fontSize: '1.1rem',
                    }}
                  >
                    S/ {(Number(quantity || 0) * Number(price || 0)).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={mutation.isPending || !isValid}
                startIcon={
                  mutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
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
                {mutation.isPending ? 'Registrando...' : 'Agregar Producto'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                type="reset"
                variant="outlined"
                fullWidth
                disabled={mutation.isPending}
                onClick={() => {
                  reset();
                  setSuccessMessage(null);
                }}
                startIcon={<ClearIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '12px 24px',
                  fontSize: '1rem',
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  '&:hover:not(:disabled)': {
                    backgroundColor: '#F9FAFB',
                    borderColor: '#6B7280',
                  },
                  '&:disabled': {
                    color: '#9CA3AF',
                    borderColor: '#D1D5DB',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>

          {/* Debug Info (solo en desarrollo) */}
          {import.meta.env.DEV && (
            <Paper
              sx={{
                padding: 2,
                marginTop: 3,
                backgroundColor: '#FEF3C7',
                border: '1px solid #FBBF24',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#92400E',
                }}
              >
                <strong>🔧 Debug Info:</strong>
                <br />
                isValid: {isValid ? '✓' : '✗'}
                <br />
                mutation.isPending: {mutation.isPending ? '✓' : '✗'}
                <br />
                expiryDate: {expiryDate || 'no establecida'}
              </Typography>
            </Paper>
          )}
        </Box>
      </Card>

      {/* Footer Note */}
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ textAlign: 'center', marginTop: 3 }}
      >
        ¿Necesitas ayuda? Consulta con el administrador del inventario
      </Typography>
    </Container>
  );
}
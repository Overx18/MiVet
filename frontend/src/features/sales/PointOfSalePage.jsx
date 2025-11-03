import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import ProductGrid from './ProductGrid';
import SaleCart from './SaleCart';
import PaymentModal from './PaymentModal';

// Funciones API
const fetchProducts = (token) =>
  apiClient
    .get('/products', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.products.map((p) => ({ ...p, type: 'product' })));

const fetchServices = (token) =>
  apiClient
    .get('/services', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.map((s) => ({ ...s, type: 'service' })));

const fetchClients = (token) =>
  apiClient
    .get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.users || []);

export default function PointOfSalePage() {
  const { token } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    showModal: false,
    clientSecret: null,
    saleId: null,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState(null);

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(token),
    enabled: !!token,
    keepPreviousData: true,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(token),
    enabled: !!token,
    keepPreviousData: true,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token,
    keepPreviousData: true,
  });

  // Combinar items
  const allItems = useMemo(
    () => [...(products || []), ...(services || [])],
    [products, services]
  );

  // Manejar redirección de Stripe
  useEffect(() => {
    if (searchParams.get('sale_success') === 'true') {
      const saleId = searchParams.get('sale_id');
      setSuccessMessage(`¡Venta #${saleId} pagada y completada con éxito!`);
      toast.success(`¡Venta #${saleId} completada!`);

      // Limpiar URL params
      searchParams.delete('sale_success');
      searchParams.delete('sale_id');
      setSearchParams(searchParams, { replace: true });

      // Auto-limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams, setSearchParams]);

  // Handlers
  const addToCart = (item) => {
    console.log('➕ Agregando al carrito:', item);
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (i) => i.id === item.id && i.type === item.type
      );
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} agregado al carrito`);
  };

  const updateQuantity = (item, newQuantity) => {
    console.log('🔄 Actualizando cantidad:', item.name, newQuantity);
    if (newQuantity <= 0) {
      setCart((prev) =>
        prev.filter((i) => i.id !== item.id || i.type !== item.type)
      );
      toast(`${item.name} removido del carrito`);
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    }
  };

  const clearCart = () => {
    console.log('🗑️ Limpiando carrito');
    setCart([]);
    setSelectedClient(null);
  };

  const handlePaymentSuccess = () => {
    console.log('✅ Pago exitoso');
    setPaymentInfo({ showModal: false, clientSecret: null, saleId: null });
    clearCart();
  };

  const isLoading = productsLoading || servicesLoading || clientsLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        paddingY: 2,
      }}
    >
      {/* Header */}
      <Container maxWidth="xl" sx={{ marginBottom: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StoreIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1F2937',
                }}
              >
                Punto de Venta
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gestiona ventas y servicios en tiempo real
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
            <Box
              sx={{
                backgroundColor: '#DC2626',
                color: 'white',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {cart.length}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Success Message */}
      {successMessage && (
        <Container maxWidth="xl" sx={{ marginBottom: 2 }}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            onClose={() => setSuccessMessage(null)}
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
        </Container>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Container maxWidth="xl">
          <Paper
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
            }}
          >
            <CircularProgress sx={{ marginBottom: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Cargando productos y servicios...
            </Typography>
          </Paper>
        </Container>
      ) : (
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Productos y Servicios */}
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#1F2937',
                    }}
                  >
                    📦 Catálogo de Productos y Servicios
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {allItems.length} artículos disponibles
                  </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ padding: 3 }}>
                  {allItems.length > 0 ? (
                    <ProductGrid
                      items={allItems}
                      onAddToCart={addToCart}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="textSecondary">
                        No hay productos o servicios disponibles
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Carrito */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <SaleCart
                  cart={cart}
                  clients={clients}
                  selectedClient={selectedClient}
                  onSelectClient={setSelectedClient}
                  onUpdateQuantity={updateQuantity}
                  onClearCart={clearCart}
                  onProcessSale={setPaymentInfo}
                  isClientsLoading={clientsLoading}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Info Cards */}
          {cart.length === 0 && (
            <Paper
              sx={{
                marginTop: 3,
                padding: 3,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <InfoIcon sx={{ color: '#1E40AF', fontSize: 24, mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: '#1E40AF', mb: 0.5 }}
                  >
                    💡 Cómo usar el Punto de Venta
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    1. Selecciona productos o servicios del catálogo haciendo clic en ellos
                    <br />
                    2. Ajusta las cantidades en el carrito
                    <br />
                    3. Selecciona un cliente (opcional)
                    <br />
                    4. Haz clic en "Procesar Venta" para realizar el pago
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Container>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentInfo.showModal}
        onClose={() =>
          setPaymentInfo({ ...paymentInfo, showModal: false })
        }
        clientSecret={paymentInfo.clientSecret}
        saleId={paymentInfo.saleId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  );
}
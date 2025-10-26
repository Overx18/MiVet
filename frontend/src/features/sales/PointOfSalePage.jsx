// frontend/src/features/sales/PointOfSalePage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom'; // Importar useSearchParams
import toast from 'react-hot-toast'; // Importar toast
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import ProductGrid from './ProductGrid';
import SaleCart from './SaleCart';
import PaymentModal from './PaymentModal';

const fetchProducts = (token) => apiClient.get('/products', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.products.map(p => ({ ...p, type: 'product' })));
const fetchServices = (token) => apiClient.get('/services', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.map(s => ({ ...s, type: 'service' })));
const fetchClients = (token) => apiClient.get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.users || []);

export default function PointOfSalePage() {
  const { token } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({ showModal: false, clientSecret: null, saleId: null });
  const [searchParams, setSearchParams] = useSearchParams(); // Hook para leer URL params

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => fetchProducts(token), enabled: !!token });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => fetchServices(token), enabled: !!token });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => fetchClients(token), enabled: !!token });

  const allItems = useMemo(() => [...(products || []), ...(services || [])], [products, services]);

  // Efecto para manejar la redirección de Stripe
  useEffect(() => {
    if (searchParams.get('sale_success') === 'true') {
      const saleId = searchParams.get('sale_id');
      toast.success(`¡Venta #${saleId} pagada y completada con éxito!`);
      
      // Limpiar los parámetros de la URL para evitar que el mensaje se repita al recargar
      searchParams.delete('sale_success');
      searchParams.delete('sale_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id && i.type === item.type);
      if (existingItem) {
        return prevCart.map(i => i.id === item.id && i.type === item.type ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== item.id || i.type !== item.type));
    } else {
      setCart(prev => prev.map(i => i.id === item.id && i.type === item.type ? { ...i, quantity: newQuantity } : i));
    }
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
  };

  const handlePaymentSuccess = () => {
    setPaymentInfo({ showModal: false, clientSecret: null, saleId: null });
    clearCart();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      <div className="w-3/5 p-4 overflow-y-auto">
        <ProductGrid items={allItems} onAddToCart={addToCart} />
      </div>
      <div className="w-2/5 p-4 bg-white shadow-lg">
        <SaleCart
          cart={cart}
          clients={clients}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onProcessSale={setPaymentInfo}
        />
      </div>
      <PaymentModal
        isOpen={paymentInfo.showModal}
        onClose={() => setPaymentInfo({ ...paymentInfo, showModal: false })}
        clientSecret={paymentInfo.clientSecret}
        saleId={paymentInfo.saleId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
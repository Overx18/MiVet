// Muestra el carrito, totales, selector de cliente y botones de acción
// frontend/src/features/sales/SaleCart.jsx
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const TAX_RATE = 0.18; // 18% IVA

const processSaleApi = ({ saleData, token }) => apiClient.post('/sales', saleData, { headers: { Authorization: `Bearer ${token}` } });

export default function SaleCart({ cart, clients, selectedClient, onSelectClient, onUpdateQuantity, onClearCart, onProcessSale }) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = sub * TAX_RATE;
    const total = sub + tax;
    return { subtotal: sub, taxAmount: tax, totalAmount: total };
  }, [cart]);

  const saleMutation = useMutation({
    mutationFn: processSaleApi,
    onSuccess: (response, variables) => {
      if (variables.saleData.paymentMethod === 'Efectivo') {
        toast.success('Venta en efectivo registrada!');
        onClearCart();
      } else { // Tarjeta
        toast.success('Venta registrada. Procediendo al pago...');
        onProcessSale({
          showModal: true,
          clientSecret: response.data.clientSecret,
          saleId: response.data.saleId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Para actualizar stock
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al procesar la venta.'),
  });

  const handleProcessSale = () => {
    if (!selectedClient) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    if (cart.length === 0) {
      toast.error('El carrito está vacío.');
      return;
    }

    const saleData = {
      clientId: selectedClient.id,
      items: cart.map(item => ({ id: item.id, type: item.type, quantity: item.quantity, price: item.price })),
      paymentMethod,
      subtotal,
      taxAmount,
      totalAmount,
    };

    saleMutation.mutate({ saleData, token });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Carrito de Venta</h2>
      
      <select onChange={(e) => onSelectClient(clients.find(c => c.id === e.target.value))} value={selectedClient?.id || ''} className="w-full p-2 border rounded-md mb-4">
        <option value="">-- Seleccionar Cliente --</option>
        {clients.map(client => <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>)}
      </select>

      <div className="flex-grow overflow-y-auto border-t border-b py-2">
        {cart.length === 0 ? <p className="text-gray-500 text-center mt-4">El carrito está vacío</p> : (
          cart.map(item => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between mb-2 p-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">S/ {Number(item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => onUpdateQuantity(item, item.quantity - 1)} className="px-2 py-0.5 bg-gray-200 rounded">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item, item.quantity + 1)} className="px-2 py-0.5 bg-gray-200 rounded">+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal:</span><span>S/ {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>IVA (18%):</span><span>S/ {taxAmount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>S/ {totalAmount.toFixed(2)}</span></div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Método de Pago</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 border rounded-md">
            <option>Efectivo</option>
            <option>Tarjeta</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={handleProcessSale} disabled={saleMutation.isPending} className="w-full p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400">
            {saleMutation.isPending ? 'Procesando...' : 'Procesar Venta'}
          </button>
          <button onClick={onClearCart} className="w-full p-3 bg-red-500 text-white font-bold rounded-md hover:bg-red-600">Limpiar</button>
        </div>
      </div>
    </div>
  );
}
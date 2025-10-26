// frontend/src/features/inventory/ProductRegistrationPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Función de API
const addProduct = ({ productData, token }) => apiClient.post('/products', productData, { headers: { Authorization: `Bearer ${token}` } });

export default function ProductRegistrationPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success('Producto registrado exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Para actualizar la lista de inventario
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar el producto.'),
  });

  const onSubmit = (data) => {
    mutation.mutate({ productData: data, token });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Registrar Nuevo Producto en Inventario</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Nombre del Producto</label>
          <input type="text" {...register('name', { required: 'El nombre es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Cantidad (Stock Inicial)</label>
          <input type="number" {...register('quantity', { required: 'La cantidad es obligatoria', valueAsNumber: true, min: { value: 0, message: 'La cantidad no puede ser negativa' } })} className="w-full px-3 py-2 border rounded-md" />
          {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Precio de Venta (S/.)</label>
          <input type="number" step="0.01" {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true, min: { value: 0, message: 'El precio no puede ser negativo' } })} className="w-full px-3 py-2 border rounded-md" />
          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Proveedor (Opcional)</label>
          <input type="text" {...register('provider')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha de Caducidad (Opcional)</label>
          <input type="date" {...register('expiryDate')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Descripción (Opcional)</label>
          <textarea {...register('description')} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Registrando...' : 'Añadir Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
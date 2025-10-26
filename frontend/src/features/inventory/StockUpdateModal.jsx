// frontend/src/features/inventory/StockUpdateModal.jsx
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Función de API
const adjustStock = ({ productId, data, token }) => apiClient.patch(`/products/${productId}/stock`, data, { headers: { Authorization: `Bearer ${token}` } });

export default function StockUpdateModal({ isOpen, onClose, product }) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      toast.success('Stock actualizado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al actualizar el stock.'),
  });

  const onSubmit = (data) => {
    const quantityChange = data.type === 'Entrada' ? data.quantity : -data.quantity;
    mutation.mutate({
      productId: product.id,
      data: { quantityChange, type: 'Ajuste', reason: data.reason },
      token,
    });
  };

  if (!product) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Ajustar Stock de: {product.name}
              </Dialog.Title>
              <p className="text-sm text-gray-500">Stock actual: {product.quantity}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Tipo de Movimiento</label>
                  <select {...register('type', { required: true })} className="w-full px-3 py-2 border rounded-md">
                    <option value="Entrada">Entrada (Añadir al stock)</option>
                    <option value="Salida">Salida (Quitar del stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Cantidad</label>
                  <input type="number" {...register('quantity', { required: 'La cantidad es obligatoria', valueAsNumber: true, min: 1 })} className="w-full px-3 py-2 border rounded-md" />
                  {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Motivo del Ajuste</label>
                  <input type="text" {...register('reason', { required: 'El motivo es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
                  {errors.reason && <p className="text-sm text-red-600">{errors.reason.message}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md">Cancelar</button>
                  <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border rounded-md disabled:bg-blue-300">
                    {mutation.isPending ? 'Guardando...' : 'Confirmar Ajuste'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
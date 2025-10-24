// frontend/src/features/admin/ServiceManagementPage.jsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';

// Funciones de API
const fetchServices = (token) => 
  apiClient.get('/services', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const addService = ({ serviceData, token }) => 
  apiClient.post('/services', serviceData, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const removeService = ({ id, token }) => 
  apiClient.delete(`/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default function ServiceManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(token),
    enabled: !!token,
  });

  const addMutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      toast.success('Servicio añadido exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al añadir el servicio.'),
  });

  const deleteMutation = useMutation({
    mutationFn: removeService,
    onSuccess: () => {
      toast.success('Servicio eliminado.');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al eliminar.'),
  });

  const onSubmit = (data) => {
    addMutation.mutate({ serviceData: data, token });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      deleteMutation.mutate({ id, token });
    }
  };
    // --- UI ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Cargando servicios...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Añadir Nuevo Servicio</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input type="text" {...register('name', { required: 'El nombre es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Precio (S/.)</label>
              <input type="number" step="0.01" {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md" />
              {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Duración (minutos)</label>
              <input type="number" {...register('duration', { required: 'La duración es obligatoria', valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md" />
              {errors.duration && <p className="text-sm text-red-600">{errors.duration.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <select {...register('type', { required: 'El tipo es obligatorio' })} className="w-full px-3 py-2 border rounded-md">
                <option value="">Seleccione un tipo...</option>
                <option value="Médico">Médico</option>
                <option value="Estético">Estético</option>
              </select>
              {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <textarea {...register('description')} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {addMutation.isPending ? 'Añadiendo...' : 'Añadir Servicio'}
            </button>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Catálogo de Servicios</h2>
          {isLoading ? <div>Cargando servicios...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Nombre</th>
                    <th className="py-2 px-4 border-b text-left">Precio</th>
                    <th className="py-2 px-4 border-b text-left">Duración</th>
                    <th className="py-2 px-4 border-b text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services?.map((service) => (
                    <tr key={service.id}>
                      <td className="py-2 px-4 border-b">{service.name}</td>
                      <td className="py-2 px-4 border-b">S/ {service.price}</td>
                      <td className="py-2 px-4 border-b">{service.duration} min</td>
                      <td className="py-2 px-4 border-b">
                        <button onClick={() => handleDelete(service.id)} disabled={deleteMutation.isPending} className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
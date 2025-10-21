// frontend/src/features/admin/SpeciesManagementPage.jsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchSpecies = (token) => apiClient.get('/species', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const addSpecies = ({ name, description, token }) => apiClient.post('/species', { name, description }, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const removeSpecies = ({ id, token }) => apiClient.delete(`/species/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default function SpeciesManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Query para obtener las especies
  const { data: speciesList, isLoading } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  // Mutación para añadir una especie
  const addMutation = useMutation({
    mutationFn: addSpecies,
    onSuccess: () => {
      toast.success('Especie añadida exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al añadir la especie.'),
  });

  // Mutación para eliminar una especie
  const deleteMutation = useMutation({
    mutationFn: removeSpecies,
    onSuccess: () => {
      toast.success('Especie eliminada.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al eliminar.'),
  });

  const onSubmit = (data) => {
    addMutation.mutate({ ...data, token });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta especie?')) {
      deleteMutation.mutate({ id, token });
    }
  };

  if (isLoading) return <div>Cargando catálogo de especies...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Añadir Nueva Especie</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre de la Especie</label>
              <input type="text" {...register('name', { required: 'El nombre es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción (Opcional)</label>
              <textarea {...register('description')} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {addMutation.isPending ? 'Añadiendo...' : 'Añadir Especie'}
            </button>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Catálogo de Especies</h2>
          <ul className="space-y-2">
            {speciesList?.map((species) => (
              <li key={species.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="font-medium">{species.name}</span>
                <button
                  onClick={() => handleDelete(species.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
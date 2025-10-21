// frontend/src/features/pets/PetRegistrationPage.jsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchSpecies = (token) => apiClient.get('/species', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const fetchClients = (token) => apiClient.get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const registerPet = ({ petData, token }) => apiClient.post('/pets', petData, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function PetRegistrationPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Query para obtener las especies
  const { data: speciesList, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  // Query para obtener clientes (solo si el usuario es Recepcionista)
  const { data: clientsList, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token && user?.role === 'Recepcionista' || user?.role === 'Admin',
  });

  // Mutación para registrar la mascota
  const mutation = useMutation({
    mutationFn: registerPet,
    onSuccess: () => {
      toast.success('Mascota registrada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['pets'] }); // Para actualizar listas de mascotas
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar la mascota.'),
  });

  const onSubmit = (data) => {
    // Si el usuario es un cliente, asigna su propio ID como propietario.
    // Si es recepcionista, el ownerId ya viene del formulario.
    const petData = {
      ...data,
      ownerId: user?.role === 'Cliente' ? user.id : data.ownerId,
    };
    mutation.mutate({ petData, token });
  };

  if (isLoadingSpecies || (user?.role === 'Recepcionista' || user?.role === 'Admin' && isLoadingClients)) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Registrar Nueva Mascota</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo para seleccionar propietario (solo para Recepcionista y Admin) */}
        {user?.role === 'Recepcionista' || user?.role === 'Admin' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Propietario (Cliente)</label>
            <select {...register('ownerId', { required: 'Debe seleccionar un propietario' })} className="w-full px-3 py-2 border rounded-md">
              <option value="">Seleccione un cliente...</option>
              {clientsList?.map(client => (
                <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
              ))}
            </select>
            {errors.ownerId && <p className="text-sm text-red-600">{errors.ownerId.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input type="text" {...register('name', { required: 'El nombre es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Especie</label>
          <select {...register('speciesId', { required: 'La especie es obligatoria' })} className="w-full px-3 py-2 border rounded-md">
            <option value="">Seleccione una especie...</option>
            {speciesList?.map(species => (
              <option key={species.id} value={species.id}>{species.name}</option>
            ))}
          </select>
          {errors.speciesId && <p className="text-sm text-red-600">{errors.speciesId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Raza</label>
          <input type="text" {...register('race')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">Género</label>
          <select {...register('gender')} className="w-full px-3 py-2 border rounded-md">
            <option value="">Seleccione...</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha de Nacimiento</label>
          <input type="date" {...register('birthDate')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">Peso (kg)</label>
          <input type="number" step="0.1" {...register('weight')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Notas Adicionales</label>
          <textarea {...register('notes')} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Registrando...' : 'Registrar Mascota'}
          </button>
        </div>
      </form>
    </div>
  );
}
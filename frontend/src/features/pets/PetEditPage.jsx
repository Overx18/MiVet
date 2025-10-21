// frontend/src/features/pets/PetEditPage.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- Funciones de API ---
const fetchPetById = ({ id, token }) =>
  apiClient.get(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.data);

const updatePet = ({ id, petData, token }) =>
  apiClient.put(`/pets/${id}`, petData, { headers: { Authorization: `Bearer ${token}` } });

const fetchSpecies = (token) =>
  apiClient.get('/species', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const fetchClients = (token) =>
  apiClient.get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function PetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Query para obtener los datos de la mascota a editar
  const { data: pet, isLoading: isLoadingPet, isError, error } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => fetchPetById({ id, token }),
    enabled: !!id && !!token,
  });

  // Queries para listas de especies y clientes
  const { data: speciesList, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  const { data: clientsList, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token && (user?.role === 'Admin' || user?.role === 'Recepcionista'),
  });
  
  // Rellenar el formulario cuando los datos de la mascota se cargan
  useEffect(() => {
    if (pet) {
      const formattedPet = {
        ...pet,
      };
      reset(formattedPet);
        }
      }, [pet, reset]);

  // Mutación para actualizar la mascota
  const mutation = useMutation({
    mutationFn: updatePet,
    onSuccess: () => {
      toast.success('Mascota actualizada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['pets'] }); // Invalida la lista de mascotas
      queryClient.invalidateQueries({ queryKey: ['pet', id] }); // Invalida los datos de esta mascota
      navigate('/pets'); // Redirige a la lista de mascotas
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al actualizar la mascota.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ id, petData: data, token });
  };

  // --- Renderizado ---
  if (isLoadingPet || isLoadingSpecies || (user?.role !== 'Cliente' && isLoadingClients)) {
    return <div className="text-center mt-8">Cargando datos de la mascota...</div>;
  }

  if (isError) {
    return <div className="text-center mt-8 text-red-500">Error: {error.response?.data?.message || error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Mascota: {pet?.name}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'El nombre es obligatorio' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Selector de Propietario (solo para Admin/Recepcionista) */}
        {(user?.role === 'Admin' || user?.role === 'Recepcionista') && (
          <div>
            <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">Propietario</label>
            <select
              id="ownerId"
              {...register('ownerId', { required: 'El propietario es obligatorio' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {clientsList?.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="text-red-500 text-xs mt-1">{errors.ownerId.message}</p>}
          </div>
        )}

        {/* Resto de los campos del formulario */}
        <div>
          <label htmlFor="speciesId" className="block text-sm font-medium text-gray-700">Especie</label>
          <select
            id="speciesId"
            {...register('speciesId', { required: 'La especie es obligatoria' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {speciesList?.map(species => (
              <option key={species.id} value={species.id}>{species.name}</option>
            ))}
          </select>
          {errors.speciesId && <p className="text-red-500 text-xs mt-1">{errors.speciesId.message}</p>}
        </div>

        <div>
          <label htmlFor="race" className="block text-sm font-medium text-gray-700">Raza</label>
          <input
            id="race"
            type="text"
            {...register('race')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
         {  
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
          <input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
         }
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
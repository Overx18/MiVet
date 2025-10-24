// frontend/src/features/pets/PetRegistrationPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// ==== API FUNCTIONS ====

// Obtener especies disponibles
const fetchSpecies = async (token) => {
  const { data } = await apiClient.get('/species', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
};

// Obtener lista de clientes (solo para recepcionistas)
const fetchClients = async (token) => {
  try {
    const { data } = await apiClient.get('/users?role=Cliente', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data?.users) ? data.users : [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

// Crear mascota
const createPet = async ({ petData, token }) => {
  const { data } = await apiClient.post('/pets', petData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ==== COMPONENTE PRINCIPAL ====

export default function PetRegistrationPage() {
  const { token, user } = useAuthStore();
  const isReceptionist = user?.role === 'Recepcionista';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Obtener especies
  const { data: speciesList = [], isLoading: loadingSpecies } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
  });

  // Obtener clientes (solo recepcionista)
  const { data: clientsList = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: !!token && isReceptionist,
  });

  // Mutación: crear mascota
  const mutation = useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      toast.success('Mascota registrada correctamente 🐾');
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al registrar la mascota.');
    },
  });

  // Envío del formulario
  const onSubmit = (formData) => {
    const petData = {
      name: formData.name,
      speciesId: formData.speciesId,
      race: formData.race,
      age: formData.age ? Number(formData.age) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      gender: formData.gender || null,
      birthDate: formData.birthDate || null,
      notes: formData.notes || null,
      ...(isReceptionist ? { ownerId: formData.ownerId } : {}),
    };

    mutation.mutate({ petData, token });
  };

  // Estados de carga
  if (loadingSpecies || (isReceptionist && loadingClients)) {
    return <div className="text-center py-8 text-gray-600">Cargando datos...</div>;
  }

  // Validar datos cargados
  if (isReceptionist && !Array.isArray(clientsList)) {
    return <div className="text-center text-red-500">Error: la lista de clientes no es válida.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nueva Mascota</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Dueño (solo recepcionista) */}
        {isReceptionist && (
          <div>
            <label className="block text-sm font-medium mb-1">Propietario *</label>
            <select
              {...register('ownerId', { required: 'Selecciona un cliente' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Selecciona un cliente</option>
              {Array.isArray(clientsList) && clientsList.length > 0 ? (
                clientsList.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))
              ) : (
                <option disabled>No hay clientes disponibles</option>
              )}
            </select>
            {errors.ownerId && <p className="text-sm text-red-600">{errors.ownerId.message}</p>}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            {...register('name', { required: 'El nombre es obligatorio' })}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Especie */}
        <div>
          <label className="block text-sm font-medium mb-1">Especie *</label>
          <select
            {...register('speciesId', { required: 'Selecciona una especie' })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Selecciona una especie</option>
            {speciesList.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
          {errors.speciesId && <p className="text-sm text-red-600">{errors.speciesId.message}</p>}
        </div>

        {/* Raza */}
        <div>
          <label className="block text-sm font-medium mb-1">Raza</label>
          <input type="text" {...register('race')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        {/* Edad y Peso */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Edad (años)</label>
            <input type="number" {...register('age')} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Peso (kg)</label>
            <input type="number" {...register('weight')} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium mb-1">Género</label>
          <select {...register('gender')} className="w-full px-3 py-2 border rounded-md">
            <option value="">Selecciona...</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
          <input type="date" {...register('birthDate')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea {...register('notes')} rows={3} className="w-full px-3 py-2 border rounded-md" />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {mutation.isPending ? 'Guardando...' : 'Registrar Mascota'}
        </button>
      </form>
    </div>
  );
}

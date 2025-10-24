// frontend/src/features/auth/ProfilePage.jsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchProfile = async (token) => {
  const { data } = await apiClient.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateUserProfile = async ({ profileData, token }) => {
  const { data } = await apiClient.put('/users/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function ProfilePage() {
  const { token, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // 1. Obtener datos del perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchProfile(token),
    enabled: !!token, // Solo ejecutar si hay un token
  });

  // 2. Poblar el formulario cuando los datos del perfil se cargan
  useEffect(() => {
    console.log('Perfil cargado:', profile);
    if (profile?.user) {
      reset(profile.user);
    } else if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  // 3. Mutación para actualizar el perfil
  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user); // Actualizar el usuario en el store de Zustand
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Refrescar los datos del perfil
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil.');
    },
  });

  const onSubmit = (data) => {
    // No enviar la contraseña si está vacía
    if (data.password === '') {
      delete data.password;
    }
    mutation.mutate({ profileData: data, token });
  };

  if (isLoading) return <div>Cargando perfil...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campos del formulario */}
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input type="text" {...register('firstName', { required: 'El nombre es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
          {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Apellido</label>
          <input type="text" {...register('lastName', { required: 'El apellido es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
          {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email (no editable)</label>
          <input type="email" {...register('email')} readOnly className="w-full px-3 py-2 border rounded-md bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input type="tel" {...register('phone')} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium">Dirección</label>
          <input type="text" {...register('address')} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nueva Contraseña (dejar en blanco para no cambiar)</label>
          <input type="password" {...register('password', { minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className="w-full px-3 py-2 border rounded-md" autoComplete="new-password" />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
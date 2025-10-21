// frontend/src/features/auth/RegisterPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';

// Función que realiza la petición de registro
const registerUser = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success(data.message);
      // Aquí podrías redirigir al usuario o limpiar el formulario
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Ocurrió un error al registrarse.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Crear una Cuenta</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="block text-sm font-medium">Email</label>
            <input type="email" {...register('email', { required: 'El email es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input type="password" {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className="w-full px-3 py-2 border rounded-md" />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
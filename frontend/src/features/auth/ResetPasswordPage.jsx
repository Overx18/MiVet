// frontend/src/features/auth/ResetPasswordPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';

const resetPassword = ({ token, password }) => apiClient.patch(`/auth/reset-password/${token}`, { password });

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.data.message);
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'El enlace es inválido o ha expirado.');
    },
  });

  const onSubmit = ({ password }) => {
    mutation.mutate({ token, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Establecer Nueva Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nueva Contraseña</label>
            <input type="password" {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className="w-full px-3 py-2 border rounded-md" />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
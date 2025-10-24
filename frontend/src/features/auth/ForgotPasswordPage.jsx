// frontend/src/features/auth/ForgotPasswordPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';

const requestPasswordReset = (email) => apiClient.post('/auth/forgot-password', { email });

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success(data.data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ocurrió un error.');
    },
  });

  const onSubmit = ({ email }) => {
    mutation.mutate(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Recuperar Contraseña</h2>
        <p className="text-center text-gray-600">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" {...register('email', { required: 'El email es obligatorio' })} className="w-full px-3 py-2 border rounded-md" autoComplete="new-password"/>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Enviando...' : 'Enviar Enlace'}
          </button>
        </form>
      </div>
    </div>
  );
}
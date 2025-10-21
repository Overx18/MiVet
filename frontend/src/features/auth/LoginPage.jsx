// frontend/src/features/auth/LoginPage.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import { Link } from 'react-router-dom';

// Función que realiza la petición de login
const loginUser = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Guardar token y usuario en el store de Zustand
      setToken(data.token);
      setUser(data.user);
      toast.success('¡Bienvenido de vuelta!');
      // Redirigir al dashboard principal (o según el rol)
      navigate('/dashboard');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (credentials) => {
    mutation.mutate(credentials);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" {...register('email', { required: 'El email es obligatorio' })} className="w-full px-3 py-2 border rounded-md" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input type="password" {...register('password', { required: 'La contraseña es obligatoria' })} className="w-full px-3 py-2 border rounded-md" />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {/* 2. Añadir el enlace de recuperación */}
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {mutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
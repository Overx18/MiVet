//Componente para proteger rutas según rol y autenticación
// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el contenido de la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;
//Componente para proteger rutas según rol y autenticación
// frontend/src/routes/ProtectedRoute.jsx
// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Redirigir si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si no hay roles definidos en la ruta, permitir acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // 3. Validar si el rol del usuario está incluido en los permitidos
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Si pasa todas las validaciones, renderiza el contenido
  return <Outlet />;
};

export default ProtectedRoute;

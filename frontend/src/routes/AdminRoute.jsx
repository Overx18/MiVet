// frontend/src/routes/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Admin') {
    // Si no es admin, redirige al dashboard (o a una página de "no autorizado")
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
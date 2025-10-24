// frontend/src/components/layout/MainLayout.jsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirige a la página de login tras cerrar sesión
  };

  
  return (
    <div>
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">MiVet</Link>
          <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Enlace para registrar mascota (Visible para Cliente o Recepcionista) */}
                  {(user?.role === 'Cliente' || user?.role === 'Recepcionista') && (
                    <>
                      <Link to="/pets/register" className="text-gray-700 hover:text-blue-600">Registrar Mascota</Link>
                      <Link to="/appointments/new" className="text-gray-700 hover:text-blue-600">Programar Cita</Link>
                    </>
                  )}

                  {/* Enlace a Gestión de Usuarios solo para Admin */}
                  {user?.role === 'Admin' && (
                    <>
                      <Link to="/admin/users" className="text-gray-700 hover:text-blue-600">Usuarios</Link>
                      <Link to="/admin/species" className="text-gray-700 hover:text-blue-600">Especies</Link>
                      {/* Nuevo enlace para gestionar servicios */}
                      <Link to="/admin/services" className="text-gray-700 hover:text-blue-600">Servicios</Link>
                    </>
                )}
                  <Link to="/appointments/calendar" className="text-gray-700 hover:text-blue-600">Calendario</Link> 
                  <Link to="/pets" className="text-gray-700 hover:text-blue-600">Mascotas</Link>
                  {/* Añadir enlace al perfil */}
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                    Hola, {user?.firstName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">Iniciar Sesión</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Registrarse</Link>
                </>
              )}
            </div>
        </nav>
      </header>
      <main className="container mx-auto p-6">
        {/* El contenido de las páginas anidadas se renderizará aquí */}
        <Outlet />
      </main>
    </div>
  );
}
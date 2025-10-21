// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx'; // Importar Dashboard
import ProfilePage from './features/auth/ProfilePage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import UserManagementPage from './features/admin/UserManagementPage.jsx';
import SpeciesManagementPage from './features/admin/SpeciesManagementPage.jsx';
import PetRegistrationPage from './features/pets/PetRegistrationPage.jsx';
import PetListPage from './features/pets/PetListPage.jsx';
import PetEditPage from './features/pets/PetEditPage.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas y de autenticación anidadas en MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Rutas protegidas para usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pets" element={<PetListPage />} />
              <Route path="/pets/register" element={<PetRegistrationPage />} />
              <Route path="/pets/:id/edit" element={<PetEditPage />} />
            </Route>

            {/* Rutas protegidas solo para Administradores */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/species" element={<SpeciesManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
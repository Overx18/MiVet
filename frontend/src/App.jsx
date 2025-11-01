// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';

// Páginas públicas
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';

// Páginas protegidas
import Dashboard from './features/dashboard/Dashboard.jsx';
import ProfilePage from './features/auth/ProfilePage.jsx';
import PetRegistrationPage from './features/pets/PetRegistrationPage.jsx';
import PetListPage from './features/pets/PetListPage.jsx';
import PetEditPage from './features/pets/PetEditPage.jsx';
import AppointmentSchedulerPage from './features/appointments/AppointmentSchedulerPage.jsx';
import AppointmentsCalendarPage from './features/appointments/AppointmentsCalendarPage.jsx';
import PaymentSuccess from './features/payments/PaymentSuccess.jsx';
import PayAppointmentPage from './features/payments/PayAppointmentPage.jsx';
import ProductRegistrationPage from './features/inventory/ProductRegistrationPage.jsx';
import InventoryListPage from './features/inventory/InventoryListPage.jsx';
import PointOfSalePage from './features/sales/PointOfSalePage.jsx';
import UserManagementPage from './features/admin/UserManagementPage.jsx';
import SpeciesManagementPage from './features/admin/SpeciesManagementPage.jsx';
import ServiceManagementPage from './features/admin/ServiceManagementPage.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* 🔓 RUTAS SIN LAYOUT (pantalla completa, como Login/Register) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* 🔐 RUTAS CON LAYOUT */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pets" element={<PetListPage />} />
              <Route path="/pets/register" element={<PetRegistrationPage />} />
              <Route path="/pets/:id/edit" element={<PetEditPage />} />
              <Route path="/appointments/new" element={<AppointmentSchedulerPage />} />
              <Route path="/appointments/calendar" element={<AppointmentsCalendarPage />} />
              <Route path="/appointments/pay" element={<PayAppointmentPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
            </Route>

            {/* Solo Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/species" element={<SpeciesManagementPage />} />
              <Route path="/admin/services" element={<ServiceManagementPage />} /> 
            </Route>

            {/* Admin + Recepcionista */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']} />}>
              <Route path="/inventory/products/new" element={<ProductRegistrationPage />} />
              <Route path="/pos" element={<PointOfSalePage />} />
            </Route>

            {/* Admin + Recepcionista + Veterinario */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista', 'Veterinario']} />}>
              <Route path="/inventory" element={<InventoryListPage />} />
            </Route>  
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

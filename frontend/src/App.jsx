// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx'; 
import ProfilePage from './features/auth/ProfilePage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import UserManagementPage from './features/admin/UserManagementPage.jsx';
import SpeciesManagementPage from './features/admin/SpeciesManagementPage.jsx';
import PetRegistrationPage from './features/pets/PetRegistrationPage.jsx';
import PetListPage from './features/pets/PetListPage.jsx';
import PetEditPage from './features/pets/PetEditPage.jsx';
import ServiceManagementPage from './features/admin/ServiceManagementPage.jsx';
import AppointmentSchedulerPage from './features/appointments/AppointmentSchedulerPage.jsx';
import AppointmentsCalendarPage from './features/appointments/AppointmentsCalendarPage.jsx';
import PaymentPage from './features/payments/PaymentPage.jsx';
import PaymentSuccess from './features/payments/PaymentSuccess.jsx';
import PayAppointmentPage from './features/payments/PayAppointmentPAge.jsx'; 
import ProductRegistrationPage from './features/inventory/ProductRegistrationPage.jsx';
import InventoryListPage from './features/inventory/InventoryListPage.jsx';
import PointOfSalePage from './features/sales/PointOfSalePage.jsx';

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
              <Route path="/appointments/new" element={<AppointmentSchedulerPage />} />
              <Route path="/appointments/calendar" element={<AppointmentsCalendarPage />} />
              <Route path="/pay/:appointmentId" element={<PaymentPage />} />
              <Route path="/pay-appointment" element={<PayAppointmentPage />} /> 
              <Route path="/payment-success" element={<PaymentSuccess />} />
            </Route>

            {/* Rutas protegidas solo para Administradores */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/species" element={<SpeciesManagementPage />} />
              <Route path="/admin/services" element={<ServiceManagementPage />} /> 
            </Route>
            {/* Rutas protegidas para Administradores y recepcionistas*/}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']} />}>
              <Route path="/inventory/products/new" element={<ProductRegistrationPage />} />
              <Route path="/pos" element={<PointOfSalePage />} />
            </Route>
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
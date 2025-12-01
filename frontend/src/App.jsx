// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Páginas públicas
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';

// Páginas protegidas
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import ProfilePage from './features/auth/ProfilePage.jsx';

import PetRegistrationPage from './features/pets/PetRegistrationPage.jsx';
import PetListPage from './features/pets/PetListPage.jsx';
import PetEditPage from './features/pets/PetEditPage.jsx';

import AppointmentSchedulerPage from './features/appointments/AppointmentSchedulerPage.jsx';
import AppointmentsCalendarPage from './features/appointments/AppointmentsCalendarPage.jsx';
import PaymentSuccess from './features/payments/PaymentSuccess.jsx';
import PayAppointmentPage from './features/payments/PayAppointmentPage.jsx';
import MedicalRecordFormPage from './features/medical-records/MedicalRecordFormPage.jsx';
import PetHistoryPage from './features/medical-records/PetHistoryPage.jsx';

import ProductRegistrationPage from './features/inventory/ProductRegistrationPage.jsx';
import InventoryListPage from './features/inventory/InventoryListPage.jsx';

import PointOfSalePage from './features/sales/PointOfSalePage.jsx';

import UserManagementPage from './features/admin/UserManagementPage.jsx';
import SpeciesManagementPage from './features/admin/SpeciesManagementPage.jsx';
import ServiceManagementPage from './features/admin/ServiceManagementPage.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';

import RemindersPage from './features/chatbot/RemindersPage.jsx';

import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ⚪ RUTAS PÚBLICAS */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* 🔐 RUTAS PRIVADAS (CON LAYOUT) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Cualquier usuario autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/appointments/pay" element={<PayAppointmentPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/pets" element={<PetListPage />} />
              <Route path="/pets/:petId/history" element={<PetHistoryPage />} />
              <Route path="/reminders" element={<RemindersPage />} />

            </Route>

            {/* Cliente, Recepcionista, Veterinario, Groomer */}
            <Route
              element={<ProtectedRoute allowedRoles={['Cliente', 'Recepcionista', 'Veterinario', 'Groomer']} />}
            >
              <Route path="/appointments/calendar" element={<AppointmentsCalendarPage />} />
            </Route>

            {/* Recepcionista, Veterinario, Groomer, Admin*/}
            <Route
              element={<ProtectedRoute allowedRRoles={['Recepcionista', 'Veterinario', 'Groomer', 'Admin']} />}
            >
              <Route path="/inventory" element={<InventoryListPage />} />
            </Route> 

            {/* Veterinario, Groomer */}
            <Route element={<ProtectedRoute allowedRoles={['Veterinario', 'Groomer']} />}>
              <Route path="/medical-record/form/:appointmentId" element={<MedicalRecordFormPage />} />
            </Route>

            {/* Cliente, Recepcionista */}
            <Route element={<ProtectedRoute allowedRoles={['Cliente', 'Recepcionista']} />}>
              <Route path="/pets/register" element={<PetRegistrationPage />} />
              <Route path="/appointments/new" element={<AppointmentSchedulerPage />} />
            </Route>

            {/* Solo Recepcionista */}
            <Route element={<ProtectedRoute allowedRoles={['Recepcionista']} />}>
              <Route path="/pos" element={<PointOfSalePage />} />
            </Route>
            
            {/* Admin, Recepcionista, Cliente */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista', 'Cliente']} />}>
              <Route path="/pets/:id/edit" element={<PetEditPage />} />
            </Route>

            {/* Solo Admin */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/species" element={<SpeciesManagementPage />} />
              <Route path="/admin/services" element={<ServiceManagementPage />} />
              <Route path="/inventory/products/new" element={<ProductRegistrationPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* RUTA 404*/}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

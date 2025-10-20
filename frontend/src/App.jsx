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

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} /> 
              {/* Aquí irán otras rutas protegidas como /profile, /pets, etc. */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
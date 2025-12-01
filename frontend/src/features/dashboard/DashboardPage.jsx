// frontend/src/features/dashboard/DashboardPage.jsx
import { Container, Box } from '@mui/material';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { CircularProgress, Alert } from '@mui/material';

const fetchDashboardData = (token) =>
  apiClient.get('/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);

export default function DashboardPage() {
  const { user, token } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', user?.role],
    queryFn: () => fetchDashboardData(token),
    enabled: !!token,
    staleTime: 60000,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth={false} disableGutters sx={{ px: 3, py: 2 }}>
        <Alert severity="error">
          Error al cargar el dashboard: {error.response?.data?.message || error.message}
        </Alert>
      </Container>
    );
  }

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard user={user} />;
      case 'Cliente':
        return <ClientDashboard user={user} />;
      case 'Veterinario':
      case 'Groomer':
        return <ProfessionalDashboard data={data} user={user} />;
      case 'Recepcionista':
        return <ReceptionistDashboard data={data} user={user} />;
      default:
        return <Box>Rol no reconocido</Box>;
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ px: 3, py: 2 }}>
      {renderDashboardByRole()}
    </Container>
  );
}
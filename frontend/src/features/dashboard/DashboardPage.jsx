import { useQuery } from '@tanstack/react-query';
import { Box, Container, CircularProgress, Alert } from '@mui/material';
import { useAuthStore } from '../../store/auth.store';
import apiClient from '../../api/axios';

// Importar los dashboards específicos de cada rol
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';

const fetchDashboardData = (token) => apiClient.get('/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function DashboardPage() {
  const { user, token } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => fetchDashboardData(token),
    enabled: !!user && !!token,
  });

  if (isLoading) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  }

  if (isError) {
    return <Container sx={{ py: 4 }}><Alert severity="error">No se pudieron cargar los datos del dashboard.</Alert></Container>;
  }

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard data={data} user={user} />;
      case 'Cliente':
        return <ClientDashboard data={data} user={user} />;
      case 'Veterinario':
      case 'Groomer':
        return <ProfessionalDashboard data={data} user={user} />;
      case 'Recepcionista':
        return <ReceptionistDashboard data={data} user={user} />;
      default:
        return <Alert severity="info">Bienvenido. No hay un dashboard específico para tu rol.</Alert>;
    }
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100%', paddingY: 4 }}>
      <Container maxWidth="xl">
        {renderDashboardByRole()}
      </Container>
    </Box>
  );
}
import { Container, Grid, Typography, Box, Card, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import WelcomeHeader from './components/WelcomeHeader';

/**
 * StatCard Component - Tarjeta de estadística
 */
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }) => (
  <Paper
    sx={{
      padding: 3,
      borderRadius: 2,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
        transform: 'translateY(-2px)',
      },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: bgColor || '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ color, fontSize: 24 }} />
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon sx={{ color: '#10B981', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
            +{trend}%
          </Typography>
        </Box>
      )}
    </Box>

    <Box>
      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Paper>
);

export default function AdminDashboard({ data, user }) {
  const stats = [
    {
      title: 'Usuarios Activos',
      value: data?.userCount || 0,
      icon: PeopleIcon,
      color: '#1E40AF',
      bgColor: '#EFF6FF',
      trend: 12,
    },
    {
      title: 'Citas Pendientes',
      value: data?.pendingAppointments || 0,
      icon: EventIcon,
      color: '#D97706',
      bgColor: '#FEF3C7',
      trend: 8,
    },
    {
      title: 'Stock Bajo',
      value: data?.lowStockCount || 0,
      icon: InventoryIcon,
      color: '#DC2626',
      bgColor: '#FEE2E2',
      trend: -5,
    },
    {
      title: 'Ingresos Hoy',
      value: `S/ ${(data?.dailyIncome || 0).toFixed(2)}`,
      icon: MoneyIcon,
      color: '#059669',
      bgColor: '#F0FDF4',
      trend: 15,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <WelcomeHeader user={user} />

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Additional Sections */}
      <Grid container spacing={3}>
        {/* Próximas Secciones - Placeholder */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📊 Actividad Reciente
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aquí irán los gráficos y actividad reciente
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📈 Reportes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aquí irán los reportes y estadísticas
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
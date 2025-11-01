import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import {
  Pets as PetsIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import { useAuthStore } from '../../store/auth.store';

export default function Dashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Mascotas',
      value: '24',
      icon: PetsIcon,
      color: 'primary',
    },
    {
      title: 'Citas Hoy',
      value: '8',
      icon: CalendarIcon,
      color: 'info',
    },
    {
      title: 'Productos en Stock',
      value: '145',
      icon: InventoryIcon,
      color: 'success',
    },
    {
      title: 'Ingresos Este Mes',
      value: '$2,450',
      icon: TrendingIcon,
      color: 'warning',
    },
  ];

  return (
    <Box sx={{ paddingY: 2 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h1"
          sx={{
            marginBottom: 0.5,
            color: '#1F2937',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
          }}
        >
          Bienvenido, {user?.firstName}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Bienvenido a tu panel de MiVet.
        </Typography>
        <Typography variant="body1" color="textSecondary">
        Tu rol es: <strong>{user?.role}</strong>
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SectionCard
            title="Citas Próximas"
            subtitle="Las próximas 5 citas programadas"
          >
            <Typography color="textSecondary" variant="body2">
              No hay citas programadas
            </Typography>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard title="Actividad Reciente">
            <Typography color="textSecondary" variant="body2">
              Sin actividad registrada
            </Typography>
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent sx={{ padding: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: 2 }}>
                Guía Rápida
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
                Comienza a usar MiVet registrando mascotas, programando citas y gestionando tu clínica veterinaria de forma eficiente.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
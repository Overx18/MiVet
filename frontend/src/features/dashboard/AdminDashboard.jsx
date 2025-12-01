// frontend/src/features/dashboard/AdminDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Box, Card, List, ListItem, ListItemText, Divider, CircularProgress, Alert, Paper, Chip } from '@mui/material';
import { 
  People as PeopleIcon, 
  Inventory as InventoryIcon, 
  Event as EventIcon, 
  AttachMoney as MoneyIcon,
  Pets as PetsIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const fetchDashboardData = (token) =>
  apiClient.get('/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);

const COLORS = ['#3F51B5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard({ user }) {
  const { token } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => fetchDashboardData(token),
    enabled: !!token,
    staleTime: 60000,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error al cargar el dashboard: {error.response?.data?.message || error.message}
        </Alert>
      </Box>
    );
  }

  const formatCurrency = (amount) => `S/ ${parseFloat(amount).toFixed(2)}`;

  return (
    <>
      <WelcomeHeader user={user} />
      
      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Usuarios Activos" 
            value={data.userCount} 
            icon={PeopleIcon} 
            color="#3F51B5"
            subtitle={`+${data.newUsersThisMonth} este mes`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Citas Pendientes" 
            value={data.pendingAppointments} 
            icon={EventIcon} 
            color="#F59E0B"
            subtitle={`${data.totalAppointments} totales`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Stock Crítico" 
            value={data.criticalStockCount} 
            icon={WarningIcon} 
            color="#EF4444"
            subtitle={`${data.lowStockCount} en stock bajo`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ingresos Hoy" 
            value={formatCurrency(data.dailyIncome)} 
            icon={MoneyIcon} 
            color="#10B981"
            trend={data.monthlyGrowth > 0 ? `+${data.monthlyGrowth}%` : `${data.monthlyGrowth}%`}
          />
        </Grid>
      </Grid>

      {/* KPIs Secundarios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Total Mascotas" 
            value={data.totalPets} 
            icon={PetsIcon} 
            color="#8B5CF6"
            subtitle={`+${data.activePets} nuevas este mes`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Citas Completadas Hoy" 
            value={data.completedAppointmentsToday} 
            icon={CheckCircleIcon} 
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Ingresos del Mes" 
            value={formatCurrency(data.monthlyIncome)} 
            icon={ShoppingCartIcon} 
            color="#3F51B5"
            trend={data.monthlyGrowth > 0 ? `+${data.monthlyGrowth}%` : `${data.monthlyGrowth}%`}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Citas por Mes */}
        {data.appointmentsByMonth && data.appointmentsByMonth.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Citas por Mes (Últimos 6 meses)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.appointmentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }}
                  />
                  <Bar dataKey="count" fill="#3F51B5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Ingresos por Mes */}
        {data.incomeByMonth && data.incomeByMonth.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Ingresos por Mes (S/)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.incomeByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Distribuciones */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Usuarios por Rol */}
        {data.usersByRole && data.usersByRole.length > 0 && (
          <Grid item xs={20} md={10}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribución de Usuarios
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Top Servicios */}
        {data.topServices && data.topServices.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top 5 Servicios Más Solicitados
              </Typography>
              <List>
                {data.topServices.map((service, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {index + 1}. {service.name}
                            </Typography>
                            <Chip label={`${service.count} citas`} size="small" color="black" />
                          </Box>
                        }
                        secondary={`Ingresos: ${formatCurrency(service.revenue)}`}
                      />
                    </ListItem>
                    {index < data.topServices.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Ventas Recientes */}
      {data.recentSales && data.recentSales.length > 0 && (
        <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ventas Recientes de Hoy
          </Typography>
          <List>
            {data.recentSales.map((sale, index) => (
              <Box key={sale.id}>
                <ListItem>
                  <ListItemText
                    primary={sale.client}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{new Date(sale.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Chip label={sale.paymentMethod || 'Efectivo'} size="small" variant="outlined" />
                      </Box>
                    }
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                    {formatCurrency(sale.amount)}
                  </Typography>
                </ListItem>
                {index < data.recentSales.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>
      )}
    </>
  );
}
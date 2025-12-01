// frontend/src/features/dashboard/ClientDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Grid, 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Box, 
  Button, 
  Paper, 
  Chip, 
  Alert,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  Add as AddIcon,
  ArrowRight as ArrowRightIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalServicesIcon,
  Payment as PaymentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import StatCard from '../../components/ui/StatCard';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const fetchDashboardData = (token) =>
  apiClient.get('/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);

export default function ClientDashboard({ user }) {
  const { token } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['clientDashboard'],
    queryFn: () => fetchDashboardData(token),
    enabled: !!token,
    staleTime: 60000,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error al cargar el dashboard: {error.response?.data?.message || error.message}
        </Alert>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => `S/ ${parseFloat(amount).toFixed(2)}`;

  const pets = data?.pets || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const recentMedicalRecords = data?.recentMedicalRecords || [];
  const stats = data?.stats || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <WelcomeHeader user={user} />

      {/* Alert de Próxima Cita */}
      {stats.nextAppointmentDate && (
        <Alert 
          severity="success" 
          icon={<ScheduleIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
            <strong>📅 Próxima Cita:</strong> {stats.nextAppointmentPet} - {stats.nextAppointmentService} el {formatDate(stats.nextAppointmentDate)}
          </Typography>
        </Alert>
      )}

      {/* Estadísticas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Mis Mascotas" 
            value={stats.totalPets || 0}
            icon={PetsIcon} 
            color="#8B5CF6"
            subtitle="Registradas en el sistema"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Citas Totales" 
            value={stats.totalAppointments || 0}
            icon={EventIcon} 
            color="#3F51B5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Citas Completadas" 
            value={stats.completedAppointments || 0}
            icon={CheckCircleIcon} 
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pagos Pendientes" 
            value={stats.pendingPayments || 0}
            icon={PaymentIcon} 
            color={stats.pendingPayments > 0 ? "#EF4444" : "#10B981"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Mis Mascotas */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PetsIcon sx={{ color: '#8B5CF6', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mis Mascotas ({pets.length})
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/pets/register"
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    backgroundColor: '#F3E8FF',
                    borderColor: '#8B5CF6',
                  },
                }}
              >
                Agregar
              </Button>
            </Box>

            {pets.length > 0 ? (
              <List disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
                {pets.map((pet) => (
                  <ListItem
                    key={pet.id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      backgroundColor: '#F9FAFB',
                      borderRadius: 1,
                      border: '1px solid #E5E7EB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={pet.photoUrl}
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: '#F3E8FF',
                        }}
                      >
                        <PetsIcon sx={{ color: '#8B5CF6' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                          {pet.name}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={pet.species}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22 }}
                            />
                            {pet.breed && (
                              <Chip
                                label={pet.breed}
                                size="small"
                                sx={{ height: 22, backgroundColor: '#F3E8FF', color: '#8B5CF6' }}
                              />
                            )}
                          </Box>
                          <Typography component="span" variant="caption" color="textSecondary">
                            {pet.age ? `${pet.age} años` : 'Edad no registrada'} • 
                            {pet.weight ? ` ${pet.weight} kg` : ' Peso no registrado'} •
                            {` Registrado hace ${pet.daysRegistered} días`}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#F9FAFB',
                  border: '1px dashed #D1D5DB',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <PetsIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                  No tienes mascotas registradas
                </Typography>
                <Button
                  component={Link}
                  to="/pets/register"
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#8B5CF6',
                    '&:hover': {
                      backgroundColor: '#7C3AED',
                    },
                  }}
                >
                  Registrar Primera Mascota
                </Button>
              </Paper>
            )}
          </Card>
        </Grid>

        {/* Próximas Citas */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ color: '#3F51B5', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Próximas Citas ({upcomingAppointments.length})
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/appointments/new"
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#3F51B5',
                  color: '#3F51B5',
                  '&:hover': {
                    backgroundColor: '#EFF6FF',
                    borderColor: '#3F51B5',
                  },
                }}
              >
                Agendar
              </Button>
            </Box>

            {upcomingAppointments.length > 0 ? (
              <List disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
                {upcomingAppointments.map((app) => (
                  <ListItem
                    key={app.id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      backgroundColor: '#F9FAFB',
                      borderRadius: 1,
                      border: '1px solid #E5E7EB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={app.pet.photoUrl}
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: '#EFF6FF',
                        }}
                      >
                        <EventIcon sx={{ color: '#3F51B5' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                          {app.pet.name} - {app.service.name}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography component="span" variant="caption" color="textSecondary">
                            📅 {formatDate(app.dateTime)}
                          </Typography>
                          <Typography component="span" variant="caption" color="textSecondary">
                            👨‍⚕️ {app.professional}
                          </Typography>
                          <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={app.status}
                              size="small"
                              color={app.status === 'Pagada' ? 'success' : 'warning'}
                              sx={{ height: 22 }}
                            />
                            <Chip
                              label={formatCurrency(app.totalPrice)}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22 }}
                            />
                          </Box>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#F9FAFB',
                  border: '1px dashed #D1D5DB',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <EventIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                  No tienes citas programadas
                </Typography>
                <Button
                  component={Link}
                  to="/appointments/new"
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#3F51B5',
                    '&:hover': {
                      backgroundColor: '#303F9F',
                    },
                  }}
                >
                  Agendar Primera Cita
                </Button>
              </Paper>
            )}
          </Card>
        </Grid>

        {/* Historial Médico Reciente */}
        {recentMedicalRecords.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MedicalServicesIcon sx={{ color: '#059669', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Historial Médico Reciente
                </Typography>
              </Box>
              <List disablePadding>
                {recentMedicalRecords.map((record, index) => (
                  <Box key={record.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={record.pet.photoUrl}
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#F0FDF4',
                          }}
                        >
                          <MedicalServicesIcon sx={{ color: '#059669' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.pet.name} - {record.service}
                          </Typography>
                        }
                        secondary={
                          <Box component="span">
                            <Typography component="span" variant="caption" color="textSecondary" display="block">
                              {new Date(record.date).toLocaleDateString('es-ES')}
                            </Typography>
                            {record.diagnosis && (
                              <Typography component="span" variant="body2" display="block" sx={{ mt: 0.5 }}>
                                {record.diagnosis}
                              </Typography>
                            )}
                            {(record.weight || record.temperature) && (
                              <Box component="span" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                {record.weight && (
                                  <Chip label={`${record.weight} kg`} size="small" variant="outlined" />
                                )}
                                {record.temperature && (
                                  <Chip label={`${record.temperature}°C`} size="small" variant="outlined" />
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'span' }}
                      />
                    </ListItem>
                    {index < recentMedicalRecords.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
              <Button
                component={Link}
                to="/pets"
                fullWidth
                variant="outlined"
                endIcon={<ArrowRightIcon />}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Ver Historial Completo
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
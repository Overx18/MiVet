// frontend/src/features/dashboard/ProfessionalDashboard.jsx
import { useState } from 'react';
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
  Tab, 
  Tabs,
  Divider,
  IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  ArrowRight as ArrowRightIcon,
  Mic as MicIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Pets as PetsIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import StatCard from '../../components/ui/StatCard';

const COLORS = ['#10B981', '#3F51B5', '#F59E0B', '#EF4444'];

export default function ProfessionalDashboard({ data, user }) {
  const [tabValue, setTabValue] = useState(0);

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

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = data?.stats || {};
  const appointmentsToday = data?.appointmentsToday || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const recentMedicalRecords = data?.recentMedicalRecords || [];
  const appointmentStats = data?.appointmentStats || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <WelcomeHeader user={user} />

      {/* Alert Informativo */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>💼 Panel Profesional:</strong> Gestiona tus citas, consulta pacientes y optimiza tu agenda diaria.
        </Typography>
      </Alert>

      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pacientes Totales" 
            value={stats.totalPatients || 0}
            icon={PersonIcon} 
            color="#1E40AF"
            subtitle="Pacientes únicos atendidos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completadas Hoy" 
            value={stats.completedToday || 0}
            icon={CheckCircleIcon} 
            color="#10B981"
            subtitle={`${stats.todayAppointmentsCount || 0} programadas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Esta Semana" 
            value={stats.completedThisWeek || 0}
            icon={TrendingUpIcon} 
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Próximas Citas" 
            value={stats.upcomingCount || 0}
            icon={ScheduleIcon} 
            color="#F59E0B"
            subtitle="Siguiente semana"
          />
        </Grid>
      </Grid>

      {/* Tabs de Contenido */}
      <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#6B7280',
              '&.Mui-selected': {
                color: '#1E40AF',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1E40AF',
            },
          }}
        >
          <Tab label="Citas de Hoy" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Próximas Citas" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Registros Médicos" icon={<MedicalServicesIcon />} iconPosition="start" />
          <Tab label="Estadísticas" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 1: Citas de Hoy */}
          {tabValue === 0 && (
            <Box>
              {appointmentsToday.length > 0 ? (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {appointmentsToday.map((app) => (
                    <Paper
                      key={app.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                          src={app.pet.photoUrl}
                          sx={{ width: 56, height: 56, backgroundColor: '#EFF6FF' }}
                        >
                          <PetsIcon sx={{ color: '#1E40AF' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                            {app.pet.name} - {app.service.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {app.pet.species}
                          </Typography>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Cliente
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {app.client.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Hora
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatTime(app.dateTime)} ({app.service.duration} min)
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Typography variant="body2">
                                  {app.client.phone}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Chip
                                label={app.status}
                                color={app.status === 'Completada' ? 'success' : 'primary'}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            component={Link}
                            to={`/medical-record/form/${app.id}`}
                            variant="contained"
                            size="small"
                            startIcon={<MedicalServicesIcon />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              backgroundColor: '#1E40AF',
                              '&:hover': {
                                backgroundColor: '#1E3A8A',
                              },
                            }}
                          >
                            Registro
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <EventIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                    No tienes citas programadas para hoy
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Disfruta tu día o revisa las próximas citas
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 2: Próximas Citas */}
          {tabValue === 1 && (
            <Box>
              {upcomingAppointments.length > 0 ? (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {upcomingAppointments.map((app) => (
                    <ListItem
                      key={app.id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={app.pet.photoUrl} sx={{ backgroundColor: '#F0FDF4' }}>
                          <ScheduleIcon sx={{ color: '#059669' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                            {app.pet.name} - {app.service.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={formatDate(app.dateTime)}
                              size="small"
                              icon={<EventIcon />}
                              sx={{ height: 24 }}
                            />
                            <Chip
                              label={`${app.service.duration} min`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 24 }}
                            />
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
                    textAlign: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    No tienes citas próximas
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 3: Registros Médicos */}
          {tabValue === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>🎙️ Documentación Automatizada:</strong> Utiliza la grabación de audio para generar registros médicos automáticamente.
                </Typography>
              </Alert>
              
              {recentMedicalRecords.length > 0 ? (
                <List disablePadding>
                  {recentMedicalRecords.map((record, index) => (
                    <Box key={record.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar src={record.pet.photoUrl} sx={{ backgroundColor: '#F0FDF4' }}>
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
                              <Typography component="span" variant="body2" display="block" sx={{ mt: 0.5 }}>
                                {record.diagnosis}
                              </Typography>
                              {record.hasTranscription && (
                                <Chip
                                  label="Con transcripción IA"
                                  size="small"
                                  icon={<MicIcon />}
                                  color="black"
                                  sx={{ mt: 1 }}
                                />
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
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <MedicalServicesIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    No hay registros médicos recientes
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 4: Estadísticas */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Distribución de Citas (Últimos 30 días)
              </Typography>
              {appointmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {appointmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  No hay suficientes datos para mostrar estadísticas
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
}
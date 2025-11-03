import { Container, Grid, Card, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, Button, Paper, Chip, Alert, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import {
  Event as EventIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import WelcomeHeader from './components/WelcomeHeader';

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <Paper
    sx={{
      padding: 2,
      borderRadius: 2,
      backgroundColor: bgColor,
      border: `1px solid ${color}20`,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon sx={{ color, fontSize: 24 }} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

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

  const todayAppointments = data?.todayAppointments || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const servicesProvided = data?.servicesProvided || 0;
  const patientsServed = data?.patientsServed || 0;

  const stats = [
    {
      title: 'Pacientes Atendidos',
      value: patientsServed,
      icon: PersonIcon,
      color: '#1E40AF',
      bgColor: '#EFF6FF',
    },
    {
      title: 'Servicios Realizados',
      value: servicesProvided,
      icon: MedicalServicesIcon,
      color: '#059669',
      bgColor: '#F0FDF4',
    },
    {
      title: 'Citas Hoy',
      value: todayAppointments.length,
      icon: ScheduleIcon,
      color: '#D97706',
      bgColor: '#FEF3C7',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <WelcomeHeader user={user} />

      {/* Info Alert */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        <Typography variant="body2">
          <strong>💡 Panel Profesional:</strong> Gestiona tus citas, revisa registros médicos y consulta tu agenda del día.
        </Typography>
      </Alert>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
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
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 1: Citas de Hoy */}
          {tabValue === 0 && (
            <Box>
              {todayAppointments.length > 0 ? (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {todayAppointments.map((app) => (
                    <Paper
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: '#EFF6FF' }}>
                          <EventIcon sx={{ color: '#1E40AF' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                            {app.pet?.name} - {app.service?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Cliente: {app.client?.firstName} {app.client?.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={formatDate(app.dateTime)}
                              size="small"
                              icon={<EventIcon />}
                              sx={{ height: 24 }}
                            />
                            <Chip
                              label={app.status || 'Programada'}
                              color={app.status === 'Completada' ? 'success' : 'warning'}
                              variant="outlined"
                              size="small"
                              sx={{ height: 24 }}
                            />
                          </Box>
                        </Box>
                        <Button
                          component={Link}
                          to={`/appointments/${app.id}`}
                          variant="contained"
                          size="small"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#1E40AF',
                            '&:hover': {
                              backgroundColor: '#1E3A8A',
                            },
                          }}
                        >
                          Ver
                        </Button>
                      </Box>
                    </Paper>
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
                  <EventIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    No tienes citas programadas para hoy
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
                  {upcomingAppointments.slice(0, 10).map((app) => (
                    <Paper
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: '#F0FDF4' }}>
                          <ScheduleIcon sx={{ color: '#059669' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                            {app.pet?.name} - {app.service?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(app.dateTime)}
                          </Typography>
                        </Box>
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                      </Box>
                    </Paper>
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
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: '#F9FAFB',
                border: '1px dashed #D1D5DB',
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                Accede a los registros médicos de tus pacientes
              </Typography>
              <Button
                component={Link}
                to="/medical-records"
                variant="contained"
                size="small"
                endIcon={<ArrowRightIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#1E40AF',
                  '&:hover': {
                    backgroundColor: '#1E3A8A',
                  },
                }}
              >
                Ver Registros
              </Button>
            </Paper>
          )}
        </Box>
      </Card>

      {/* Quick Actions */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 2,
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBEF63',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#059669' }}>
          ⚡ Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/appointments"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  backgroundColor: '#F0FDF4',
                  borderColor: '#059669',
                },
              }}
            >
              Ver Agenda
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/medical-records"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  backgroundColor: '#F0FDF4',
                  borderColor: '#059669',
                },
              }}
            >
              Historiales
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/patients"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  backgroundColor: '#F0FDF4',
                  borderColor: '#059669',
                },
              }}
            >
              Mis Pacientes
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/profile"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  backgroundColor: '#F0FDF4',
                  borderColor: '#059669',
                },
              }}
            >
              Mi Perfil
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

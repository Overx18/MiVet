import { Container, Grid, Card, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, Button, Paper, Chip, Alert } from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  Add as AddIcon,
  ArrowRight as ArrowRightIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import WelcomeHeader from './components/WelcomeHeader';

export default function ClientDashboard({ data, user }) {
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

  const pets = data?.pets || [];
  const upcomingAppointments = data?.upcomingAppointments || [];

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
          <strong>💡 Bienvenido:</strong> En este dashboard puedes ver tus mascotas, citas y gestionar tu perfil.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Mis Mascotas */}
        <Grid item xs={12} md={6}>
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
                <PetsIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mis Mascotas
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/pets"
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#1E40AF',
                  color: '#1E40AF',
                  '&:hover': {
                    backgroundColor: '#EFF6FF',
                    borderColor: '#1E40AF',
                  },
                }}
              >
                Agregar
              </Button>
            </Box>

            {pets.length > 0 ? (
              <List disablePadding sx={{ flex: 1 }}>
                {pets.map((pet, index) => (
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
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                          {pet.name}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={pet.species?.name || 'Especie'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22 }}
                          />
                          {pet.breed && (
                            <Typography component="span" variant="caption" color="textSecondary">
                              {pet.breed}
                            </Typography>
                          )}
                        </Box>
                      }
                        secondaryTypographyProps={{ component: 'span' }} // 👈 ESTA LÍNEA ES CLAVE
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
                  to="/pets/new"
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#1E40AF',
                    '&:hover': {
                      backgroundColor: '#1E3A8A',
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
        <Grid item xs={12} md={6}>
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
                <EventIcon sx={{ color: '#1E40AF', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Próximas Citas
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/appointments"
                size="small"
                variant="outlined"
                endIcon={<ArrowRightIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#1E40AF',
                  color: '#1E40AF',
                  '&:hover': {
                    backgroundColor: '#EFF6FF',
                    borderColor: '#1E40AF',
                  },
                }}
              >
                Ver todas
              </Button>
            </Box>

            {upcomingAppointments.length > 0 ? (
              <List disablePadding sx={{ flex: 1 }}>
                {upcomingAppointments.slice(0, 5).map((app) => (
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
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: '#F0FDF4',
                        }}
                      >
                        <EventIcon sx={{ color: '#059669' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                          {app.service?.name || 'Servicio'}
                        </Typography>
                      }
                      secondary={
                        <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" component="span" color="textSecondary">
                            {formatDate(app.dateTime)}
                          </Typography>
                          <CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} />
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }} // 👈 ESTA LÍNEA ES CLAVE
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
                    backgroundColor: '#1E40AF',
                    '&:hover': {
                      backgroundColor: '#1E3A8A',
                    },
                  }}
                >
                  Agendar Cita
                </Button>
              </Paper>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 2,
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1E40AF' }}>
          ⚡ Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/pets/new"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#1E40AF',
                color: '#1E40AF',
              }}
            >
              Registrar Mascota
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/appointments/new"
              fullWidth
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#1E40AF',
                color: '#1E40AF',
              }}
            >
              Agendar Cita
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
                borderColor: '#1E40AF',
                color: '#1E40AF',
              }}
            >
              Historial Médico
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
                borderColor: '#1E40AF',
                color: '#1E40AF',
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
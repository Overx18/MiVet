import { useMemo } from 'react';
import { Box, Card, Grid, Typography, Chip, Avatar, Paper, Button } from '@mui/material';
import {
  WavingHand as WavingIcon,
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

/**
 * WelcomeHeader Component
 * 
 * Componente de bienvenida que se usa en todos los dashboards.
 * Muestra información personalizada del usuario, hora, fecha y rol.
 * 
 * Props:
 * - user: Objeto con datos del usuario (firstName, lastName, email, role, avatar)
 * - showStats: Boolean para mostrar/ocultar estadísticas (opcional)
 */
export default function WelcomeHeader({ user, showStats = true }) {
  // Obtener saludo según hora del día
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buenos días', emoji: '🌅' };
    if (hour < 18) return { text: 'Buenas tardes', emoji: '☀️' };
    return { text: 'Buenas noches', emoji: '🌙' };
  }, []);

  // Obtener información del rol
  const roleInfo = useMemo(() => {
    const roles = {
      Admin: {
        label: 'Administrador',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        icon: '👨‍💼',
      },
      Recepcionista: {
        label: 'Recepcionista',
        color: '#1E40AF',
        bgColor: '#EFF6FF',
        icon: '📞',
      },
      Veterinario: {
        label: 'Veterinario',
        color: '#059669',
        bgColor: '#F0FDF4',
        icon: '🏥',
      },
      Cliente: {
        label: 'Cliente',
        color: '#0F766E',
        bgColor: '#F0FDFA',
        icon: '👤',
      },
    };
    return roles[user?.role] || roles.Cliente;
  }, [user?.role]);

  // Formatear fecha actual
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Formatear hora actual
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Obtener iniciales del nombre
  const initials = useMemo(() => {
    const first = user?.firstName?.[0] || 'U';
    const last = user?.lastName?.[0] || 'S';
    return `${first}${last}`.toUpperCase();
  }, [user?.firstName, user?.lastName]);

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Grid container spacing={3}>
        {/* Sección de Bienvenida */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              background: 'linear-gradient(135deg, #1E40AF 0%, #0F766E 100%)',
              color: 'white',
              padding: 3,
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decoración de fondo */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                zIndex: 1,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 2 }}>
              {/* Header con Ícono y Saludo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Box
                  sx={{
                    fontSize: '2.5rem',
                    animation: 'wave 1s ease-in-out',
                    '@keyframes wave': {
                      '0%, 100%': { transform: 'rotate(0deg)' },
                      '50%': { transform: 'rotate(20deg)' },
                    },
                  }}
                >
                  {greeting.emoji}
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1.2,
                    }}
                  >
                    {greeting.text}, {user?.firstName}!
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginTop: 0.5,
                    }}
                  >
                    Bienvenido a MiVet - Gestión Veterinaria
                  </Typography>
                </Box>
              </Box>

              {/* Información de Usuario */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {initials}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>

                <Chip
                  icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                  label={roleInfo.label}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sección de Información Rápida */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2}>
            {/* Tarjeta de Rol */}
            <Grid item xs={6}>
              <Paper
                sx={{
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: roleInfo.bgColor,
                  border: `1px solid ${roleInfo.color}20`,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <Box sx={{ fontSize: '1.5rem' }}>{roleInfo.icon}</Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Tu Rol
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: roleInfo.color,
                  }}
                >
                  {roleInfo.label}
                </Typography>
              </Paper>
            </Grid>

            {/* Tarjeta de Fecha */}
            <Grid item xs={6}>
              <Paper
                sx={{
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <CalendarIcon sx={{ fontSize: 20, color: '#D97706' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Hoy
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#D97706',
                    display: 'block',
                    fontSize: '0.7rem',
                    lineHeight: 1.4,
                  }}
                >
                  {currentDate}
                </Typography>
              </Paper>
            </Grid>

            {/* Tarjeta de Hora */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBEF63',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 20, color: '#059669' }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Hora Actual
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#059669',
                        }}
                      >
                        {currentTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 1,
                        },
                        '50%': {
                          opacity: 0.7,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Línea Separadora */}
      <Box
        sx={{
          height: 1,
          backgroundColor: '#E5E7EB',
          marginTop: 3,
          borderRadius: '50%',
          opacity: 0.3,
        }}
      />
    </Box>
  );
}

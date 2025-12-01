import { useMemo } from 'react';
import { Box, Card, Grid, Typography, Chip, Avatar } from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

/**
 * WelcomeHeader Component
 * 
 * Componente de bienvenida optimizado para todos los dashboards.
 * Muestra información personalizada del usuario con diseño minimalista y elegante.
 * 
 * Props:
 * - user: Objeto con datos del usuario (firstName, lastName, email, role, avatar)
 */
export default function WelcomeHeader({ user }) {
  // Obtener saludo según hora del día
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buenos días', emoji: '🌅', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    if (hour < 18) return { text: 'Buenas tardes', emoji: '☀️', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' };
    return { text: 'Buenas noches', emoji: '🌙', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' };
  }, []);

  // Obtener información del rol
  const roleInfo = useMemo(() => {
    const roles = {
      Admin: { label: 'Administrador', color: '#DC2626', bgColor: '#FEE2E2', icon: '👨‍💼' },
      Recepcionista: { label: 'Recepcionista', color: '#1E40AF', bgColor: '#DBEAFE', icon: '📋' },
      Veterinario: { label: 'Veterinario', color: '#059669', bgColor: '#D1FAE5', icon: '🩺' },
      Groomer: { label: 'Groomer', color: '#7C3AED', bgColor: '#EDE9FE', icon: '✂️' },
      Cliente: { label: 'Cliente', color: '#0F766E', bgColor: '#CCFBF1', icon: '👤' },
    };
    return roles[user?.role] || roles.Cliente;
  }, [user?.role]);

  // Formatear fecha actual
  const currentDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Formatear hora actual en tiempo real
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
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          background: greeting.gradient,
          color: 'white',
          padding: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Decoración de fondo con círculos */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            zIndex: 1,
          }}
        />

        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
          {/* Sección principal de bienvenida */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Avatar */}
              <Avatar
                src={user?.avatar}
                sx={{
                  width: { xs: 64, md: 80 },
                  height: { xs: 64, md: 80 },
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {initials}
              </Avatar>

              {/* Información del usuario */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {greeting.text}, {user?.firstName}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      animation: 'wave 2s ease-in-out infinite',
                      '@keyframes wave': {
                        '0%, 100%': { transform: 'rotate(0deg)' },
                        '25%': { transform: 'rotate(15deg)' },
                        '75%': { transform: 'rotate(-15deg)' },
                      },
                    }}
                  >
                    {greeting.emoji}
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    mb: 2,
                  }}
                >
                  {user?.email}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<Box sx={{ fontSize: '1.2rem', ml: 1 }}>{roleInfo.icon}</Box>}
                    label={roleInfo.label}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                    label="Cuenta Verificada"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      '& .MuiChip-icon': {
                        color: '#10B981',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Sección de fecha y hora */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
                justifyContent: 'center',
              }}
            >
              {/* Fecha */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  padding: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <CalendarIcon sx={{ fontSize: 28, color: 'white', opacity: 0.9 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    Fecha
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {currentDate}
                  </Typography>
                </Box>
              </Box>

              {/* Hora */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  padding: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 28, color: 'white', opacity: 0.9 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    Hora Actual
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {currentTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

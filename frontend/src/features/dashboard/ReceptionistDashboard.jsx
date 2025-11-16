import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// API: obtener citas por rango (mismo patrón que AppointmentsCalendarPage.jsx)
const fetchAppointments = (range, token) => {
  const params = new URLSearchParams(range).toString();
  return apiClient
    .get(`/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data)
    .catch(() => []);
};

export default function ReceptionistDashboard({ user }) {
  const { token } = useAuthStore();

  // Rango: hoy (00:00 - 23:59)
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const { data: todayAppointments = [], isLoading, isError } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () =>
      fetchAppointments(
        { start: start.toISOString(), end: end.toISOString() },
        token
      ),
    enabled: !!token,
  });

  // Búsqueda rápida en la tabla
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return todayAppointments;
    return todayAppointments.filter((a) => {
      const ownerName = `${a.pet?.owner?.firstName || ''} ${a.pet?.owner?.lastName || ''}`.toLowerCase();
      return (
        (a.service?.name || '').toLowerCase().includes(q) ||
        (a.pet?.name || '').toLowerCase().includes(q) ||
        (a.professional?.firstName || '').toLowerCase().includes(q) ||
        (a.professional?.lastName || '').toLowerCase().includes(q) ||
        ownerName.includes(q)
      );
    });
  }, [search, todayAppointments]);

  // KPIs
  const kpis = useMemo(() => {
    const total = todayAppointments.length;
    const pagadas = todayAppointments.filter((a) => a.status === 'Pagada').length;
    const completadas = todayAppointments.filter((a) => a.status === 'Completada').length;
    const canceladas = todayAppointments.filter((a) => a.status === 'Cancelada').length;
    return { total, pagadas, completadas, canceladas };
  }, [todayAppointments]);

  const statusChip = (status) => {
    const map = {
      Pagada: { color: 'success', icon: <DoneAllIcon sx={{ fontSize: 16 }} /> },
      Completada: { color: 'default', icon: <DoneAllIcon sx={{ fontSize: 16 }} /> },
      Cancelada: { color: 'error', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
    };
    const cfg = map[status] || { color: 'default' };
    return (
      <Chip
        size="small"
        color={cfg.color}
        variant="outlined"
        icon={cfg.icon || null}
        label={status}
      />
    );
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarMonthIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>
          Dashboard de Recepción
        </Typography>
      </Box>

      {/* Acciones rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            component={Link}
            to="/appointments/new"
            variant="contained"
            startIcon={<EventAvailableIcon />}
          >
            Programar Cita
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            component={Link}
            to="/appointments/calendar"
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
          >
            Ver Calendario
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            component={Link}
            to="/pos"
            variant="contained"
            color="secondary"
            startIcon={<PointOfSaleIcon />}
          >
            Punto de Venta
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            component={Link}
            to="/pets"
            variant="outlined"
            startIcon={<PetsIcon />}
          >
            Mascotas/Clientes
          </Button>
        </Grid>
      </Grid>

      {/* KPIs del día */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Citas Hoy
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{kpis.total}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleDateString('es-PE')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Pagadas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>{kpis.pagadas}</Typography>
              <Typography variant="caption" color="text.secondary">Citas con pago confirmado</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Completadas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{kpis.completadas}</Typography>
              <Typography variant="caption" color="text.secondary">Atenciones finalizadas</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Canceladas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#DC2626' }}>{kpis.canceladas}</Typography>
              <Typography variant="caption" color="text.secondary">Citas anuladas hoy</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Buscador y tabla simple de próximas citas (hoy) */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospitalIcon color="primary" />
            Próximas citas de hoy
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por servicio, mascota, profesional o propietario…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">No se pudieron cargar las citas de hoy.</Alert>
          ) : filtered.length === 0 ? (
            <Alert severity="info">No hay citas que coincidan con el criterio.</Alert>
          ) : (
            <Grid container spacing={2}>
              {filtered
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                .slice(0, 8)
                .map((a) => (
                  <Grid item xs={12} key={a.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {new Date(a.dateTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} · {a.service?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duración: {a.service?.duration || 60} min
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PetsIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.pet?.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {a.professional?.firstName} {a.professional?.lastName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                          {statusChip(a.status)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Box>
        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <Button component={Link} to="/appointments/calendar" size="small">
            Ver todo el calendario
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
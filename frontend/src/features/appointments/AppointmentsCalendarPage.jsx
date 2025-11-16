import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as ClockIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  LocalHospital as LocalHospitalIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AppointmentsCalendar.css';

// --- Configuración de localización ---
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- Funciones API ---
const fetchAppointments = (range, token) => {
  const params = new URLSearchParams(range).toString();
  return apiClient
    .get(`/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data)
    .catch(() => []);
};

const updateAppointmentTime = ({ id, newDateTime, token }) =>
  apiClient.patch(`/appointments/${id}/reschedule`, { newDateTime }, {
    headers: { Authorization: `Bearer ${token}` },
  });

const cancelAppointmentById = ({ id, token }) =>
  apiClient.patch(`/appointments/${id}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

const getAvailableSlots = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/appointments/availability?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data || []);
};

export default function AppointmentsCalendarPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  // --- Estados principales ---
  const [dateRange, setDateRange] = useState({});
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Estados para reprogramación ---
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // --- Queries ---
  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['appointments', dateRange],
    queryFn: () => fetchAppointments(dateRange, token),
    enabled: !!dateRange.start && !!token,
  });

  // --- Mutaciones ---
  const rescheduleMutation = useMutation({
    mutationFn: updateAppointmentTime,
    onSuccess: () => {
      toast.success('✓ Cita reprogramada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
      setShowRescheduleModal(false);
      resetRescheduleForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al reprogramar');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointmentById,
    onSuccess: () => {
      toast.success('✓ Cita cancelada correctamente');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    },
  });

  // --- Funciones auxiliares ---
  const resetRescheduleForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
  };

  const fetchAvailableSlots = async (date, serviceId, professionalId) => {
    try {
      setLoadingSlots(true);
      const formattedDate = date.toISOString().split('T')[0];

      const slots = await getAvailableSlots(
        {
          professionalId,
          date: formattedDate,
          serviceId,
        },
        token
      );

      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('Error en fetchAvailableSlots:', error);
      toast.error('Error al cargar horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const canReschedule = (appointment) => {
    if (appointment.status !== 'Pagada') {
      return false;
    }

    const hoursUntilAppointment =
      (new Date(appointment.dateTime) - new Date()) / (1000 * 60 * 60);

    const isOwner =
      user.role === 'Cliente' && appointment.pet?.owner?.id === user.id;

    if (isOwner && hoursUntilAppointment < 24) {
      return false;
    }

    return true;
  };

  const getRescheduleErrorMessage = (appointment) => {
    if (appointment.status !== 'Pagada') {
      return `No se puede reprogramar una cita ${appointment.status.toLowerCase()}.`;
    }

    const hoursUntilAppointment =
      (new Date(appointment.dateTime) - new Date()) / (1000 * 60 * 60);

    const isOwner =
      user.role === 'Cliente' && appointment.pet?.owner?.id === user.id;

    if (isOwner && hoursUntilAppointment < 24) {
      return 'No se puede reprogramar una cita con menos de 24 horas de anticipación.';
    }

    return null;
  };

  // --- Manejadores ---
  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setShowModal(true);
  };

  const handleOpenRescheduleModal = (appointment) => {
    if (!canReschedule(appointment)) {
      const errorMsg = getRescheduleErrorMessage(appointment);
      toast.error(errorMsg);
      return;
    }

    setSelectedAppointment(appointment);
    resetRescheduleForm();
    setShowRescheduleModal(true);
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      toast.error('No puedes seleccionar una fecha en el pasado.');
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);

    const serviceId = selectedAppointment?.serviceId;
    const professionalId = selectedAppointment?.professionalId;

    if (serviceId && professionalId) {
      fetchAvailableSlots(date, serviceId, professionalId);
    } else {
      toast.error('Error: datos incompletos de la cita');
    }
  };

  const handleConfirmReschedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Por favor selecciona una fecha y hora.');
      return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (newDateTime < new Date()) {
      toast.error('La fecha y hora seleccionadas ya han pasado.');
      return;
    }

    rescheduleMutation.mutate({
      id: selectedAppointment.id,
      newDateTime,
      token,
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Pagada: { label: 'Pagada', color: 'success' },
      Completada: { label: 'Completada', color: 'default' },
      Cancelada: { label: 'Cancelada', color: 'error' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} variant="outlined" />;
  };

  // Formatear eventos para el calendario
  const events = useMemo(
    () =>
      appointments.map((app) => ({
        title: `${app.service.name} - ${app.pet.name}`,
        start: new Date(app.dateTime),
        end: new Date(
          new Date(app.dateTime).getTime() + (app.service.duration || 30) * 60000
        ),
        resource: app,
      })),
    [appointments]
  );

  // --- Componente Modal Reprogramación ---
  const RescheduleModal = () => (
    <Dialog
      open={showRescheduleModal}
      onClose={() => setShowResFcheduleModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: '#1F2937',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#1E40AF',
        }}
      >
        <EventIcon />
        Reprogramar Cita
      </DialogTitle>

      <DialogContent sx={{ paddingY: 3 }}>
        {/* Información de la cita actual */}
        <Alert severity="info" sx={{ marginBottom: 3 }}>
          <Typography variant="body2">
            <strong>Cita Actual:</strong> {selectedAppointment && format(new Date(selectedAppointment.dateTime), "dd/MM/yyyy HH:mm", { locale: es })}
          </Typography>
        </Alert>

        {/* Selector de fecha */}
        <TextField
          fullWidth
          label="Nueva Fecha"
          type="date"
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange}
          inputProps={{
            min: new Date().toISOString().split('T')[0],
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ marginBottom: 3 }}
        />

        {/* Selector de hora */}
        {selectedDate && (
          <TextField
            fullWidth
            select
            label="Hora Disponible"
            value={selectedTime || ''}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={loadingSlots || availableSlots.length === 0}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="">
              <em>Selecciona una hora</em>
            </MenuItem>
            {loadingSlots ? (
              <MenuItem disabled>Cargando horarios...</MenuItem>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay horarios disponibles</MenuItem>
            )}
          </TextField>
        )}

        {!selectedDate && (
          <Alert severity="warning">
            <Typography variant="body2">
              Selecciona una fecha para ver los horarios disponibles.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button
          onClick={() => setShowRescheduleModal(false)}
          variant="outlined"
          disabled={rescheduleMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmReschedule}
          variant="contained"
          disabled={rescheduleMutation.isPending || !selectedDate || !selectedTime}
          startIcon={
            rescheduleMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <EditIcon />
            )
          }
        >
          {rescheduleMutation.isPending ? 'Reprogramando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // --- Render ---
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Alert severity="error">
          Error al cargar las citas. Por favor, intenta nuevamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
          <EventIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Calendario de Citas
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Visualiza y gestiona todas las citas veterinarias
        </Typography>
      </Box>

      {/* Calendario */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          '& .rbc-calendar': {
            fontFamily: 'inherit',
          },
          '& .rbc-header': {
            padding: '12px 4px',
            fontWeight: 600,
            backgroundColor: '#F8FAFC',
            borderColor: '#E5E7EB',
            color: '#1F2937',
          },
          '& .rbc-today': {
            backgroundColor: '#EFF6FF',
          },
          '& .rbc-event': {
            backgroundColor: '#1E40AF',
            borderColor: '#1E3A8A',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
          },
          '& .rbc-event-label': {
            fontSize: '11px',
          },
          '& .rbc-toolbar': {
            padding: '12px',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F8FAFC',
          },
          '& .rbc-toolbar button': {
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#1E40AF',
              color: '#FFFFFF',
              borderColor: '#1E40AF',
            },
            '&.rbc-active': {
              backgroundColor: '#1E40AF',
              color: '#FFFFFF',
              borderColor: '#1E40AF',
            },
          },
          '& .rbc-month-view': {
            border: 'none',
          },
          '& .rbc-date-cell': {
            padding: '4px',
            textAlign: 'right',
          },
          '& .rbc-off-range-bg': {
            backgroundColor: '#FAFBFC',
          },
          height: 'calc(100vh - 400px)',
          minHeight: '600px',
        }}
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          culture="es"
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          popup
          selectable
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            noEventsInRange: 'No hay citas en este rango',
          }}
          style={{ height: '100%' }}
          onRangeChange={(range) => {
            const start = Array.isArray(range) ? range[0] : range.start;
            const end = Array.isArray(range) ? range[range.length - 1] : range.end;
            setDateRange({
              start: start.toISOString(),
              end: end.toISOString(),
            });
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#1E40AF',
              borderRadius: '4px',
              opacity: 0.9,
              color: 'white',
              border: 'none',
              display: 'block',
              padding: '2px 4px',
              fontSize: '12px',
            },
          })}
        />
      </Card>

      {/* Modal de Detalles */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: 'white',
            backgroundColor: '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <LocalHospitalIcon />
          Detalles de la Cita
        </DialogTitle>

        <Box sx={{ height: 12, backgroundColor: '#F9FAFB' }} />

        <DialogContent sx={{ paddingY: 3 }}>
          {selectedAppointment && (
            <Box sx={{ space: 3 }}>
              {/* Fecha y Hora */}
              <Box sx={{ marginBottom: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <ClockIcon sx={{ color: '#1E40AF', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    Fecha y Hora
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  {format(
                    new Date(selectedAppointment.dateTime),
                    "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </Typography>
              </Box>

              <Divider />

              {/* Servicio */}
              <Box sx={{ marginBottom: 3, marginTop: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <LocalHospitalIcon sx={{ color: '#1E40AF', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    Servicio
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedAppointment.service?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Duración: {selectedAppointment.service?.duration} minutos
                </Typography>
              </Box>

              <Divider />

              {/* Propietario */}
              <Box sx={{ marginBottom: 3, marginTop: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <PersonIcon sx={{ color: '#059669', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    Propietario
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedAppointment.pet?.owner?.firstName}{' '}
                  {selectedAppointment.pet?.owner?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 0.5 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                  <Typography variant="caption" color="textSecondary">
                    {selectedAppointment.pet?.owner?.phone || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Mascota */}
              <Box sx={{ marginBottom: 3, marginTop: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <PetsIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    Mascota
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedAppointment.pet?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedAppointment.pet?.species?.name || 'Especie no disponible'}
                </Typography>
              </Box>

              <Divider />

              {/* Profesional */}
              <Box sx={{ marginBottom: 3, marginTop: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <PersonIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    Profesional Asignado
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedAppointment.professional?.firstName}{' '}
                  {selectedAppointment.professional?.lastName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedAppointment.professional?.role}
                </Typography>
              </Box>

              <Divider />

              {/* Estado y Precio */}
              <Box sx={{ marginTop: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Estado
                  </Typography>
                  <Box sx={{ marginTop: 1 }}>
                    {getStatusChip(selectedAppointment.status)}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Precio
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: '#059669', marginTop: 1 }}
                  >
                    S/ {parseFloat(selectedAppointment.totalPrice || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 2, gap: 1 }}>
          {selectedAppointment?.status === 'Pagada' && (
            <>
              <Button
                onClick={() => handleOpenRescheduleModal(selectedAppointment)}
                variant="contained"
                color="primary"
                disabled={rescheduleMutation.isPending}
                startIcon={<EditIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Reprogramar
              </Button>
              <Button
                onClick={() => {
                  if (window.confirm('¿Cancelar esta cita?')) {
                    cancelMutation.mutate({
                      id: selectedAppointment.id,
                      token,
                    });
                  }
                }}
                variant="contained"
                color="error"
                disabled={cancelMutation.isPending}
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Cancelar Cita
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowModal(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cerrar
          </Button>

          {/* Botón para registrar/editar historial médico */}
          {selectedAppointment && 
           selectedAppointment.status !== 'Cancelada' && 
           ['Veterinario', 'Groomer'].includes(user?.role) && (
            <Button 
              component={Link} 
              to={`/medical-record/form/${selectedAppointment.id}`} 
              variant="contained"
              color="secondary" // Un color distintivo
            >
              {/* [SOLUCIÓN] Lógica para el texto del botón */}
              {selectedAppointment.medicalRecord ? 'Editar Historial' : 'Registrar Historial'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal Reprogramación */}
      <RescheduleModal />
    </Container>
  );
}
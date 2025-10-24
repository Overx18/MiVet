// frontend/src/features/appointments/AppointmentsCalendarPage.jsx
import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../../components/ui/Button';
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// --- Configuración de localización ---
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- Funciones API ---
const fetchAppointments = (range, token) => {
  const params = new URLSearchParams(range).toString();
  return apiClient
    .get(`/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data);
};

const updateAppointmentTime = ({ id, newDateTime, token }) =>
  apiClient.patch(`/appointments/${id}/reschedule`, { newDateTime }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default function AppointmentsCalendarPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({});
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['appointments', dateRange],
    queryFn: () => fetchAppointments(dateRange, token),
    enabled: !!dateRange.start && !!token,
  });

  const rescheduleMutation = useMutation({
    mutationFn: updateAppointmentTime,
    onSuccess: () => {
      toast.success('Cita reprogramada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo reprogramar la cita.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const handleEventDrop = ({ event, start }) => {
    if (user.role !== 'Admin' && user.role !== 'Recepcionista') {
      toast.error('No tienes permiso para reprogramar citas.');
      return;
    }
    if (window.confirm(`¿Reprogramar la cita de "${event.title}" a este nuevo horario?`)) {
      rescheduleMutation.mutate({ id: event.resource.id, newDateTime: start.toISOString(), token });
    } else {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  };

  const events = useMemo(() => appointments.map(app => ({
    title: `${app.service.name} - ${app.pet.name}`,
    start: new Date(app.dateTime),
    end: new Date(new Date(app.dateTime).getTime() + (app.service.duration || 30) * 60000),
    resource: app,
  })), [appointments]);

  // --- Render ---
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg" style={{ height: '85vh' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Calendario de Citas
        </h2>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentView(Views.MONTH)}>Mes</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView(Views.WEEK)}>Semana</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView(Views.DAY)}>Día</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView(Views.AGENDA)}>Agenda</Button>
        </div>
      </div>

      {isLoading && <p className="text-gray-500 text-center mt-10">Cargando citas...</p>}
      {isError && <p className="text-red-500 text-center mt-10">Error al cargar las citas.</p>}

      {!isLoading && !isError && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          onView={view => setCurrentView(view)}
          culture="es"
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
            setDateRange({ start: start.toISOString(), end: end.toISOString() });
          }}
          onEventDrop={handleEventDrop}
          eventPropGetter={(event) => {
            const color = event.resource.status === 'Completada'
              ? '#4caf50'
              : event.resource.status === 'Cancelada'
              ? '#e57373'
              : '#3174ad';
            return {
              style: {
                backgroundColor: color,
                borderRadius: '8px',
                color: 'white',
                border: 'none',
                padding: '4px 6px',
              },
            };
          }}
          draggableAccessor={() => user.role === 'Admin' || user.role === 'Recepcionista'}
          components={{
            toolbar: (toolbar) => (
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toolbar.onNavigate('PREV')}>
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toolbar.onNavigate('TODAY')}>
                    <RotateCcw className="w-4 h-4" />
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toolbar.onNavigate('NEXT')}>
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-lg text-gray-700">
                  {format(toolbar.date, 'MMMM yyyy', { locale: es })}
                </h3>
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}

// --- Eventos formateados ---// frontend/src/features/appointments/AppointmentsCalendarPage.jsx
import { useState, useMemo, Fragment } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../../components/ui/Button';
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// --- Configuración de localización ---
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- Funciones API ---
const fetchAppointments = (range, token) => {
const params = new URLSearchParams({
  start: range.start,
  end: range.end,
}).toString();
return apiClient
  .get(`/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
  .then(res => res.data);
};

const updateAppointmentTime = ({ id, newDateTime, token }) =>
apiClient.patch(`/appointments/${id}/reschedule`, { newDateTime }, {
  headers: { Authorization: `Bearer ${token}` },
}).then(res => res.data);

const cancelAppointmentById = ({ id, token }) =>
apiClient.patch(`/appointments/${id}/cancel`, {}, {
  headers: { Authorization: `Bearer ${token}` },
}).then(res => res.data);

const fetchAvailableSlots = ({ professionalId, date, serviceId, token }) => {
const params = new URLSearchParams({
  professionalId,
  date,
  serviceId,
}).toString();
return apiClient
  .get(`/appointments/availability?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => res.data);
};

export default function AppointmentsCalendarPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [newDateTime, setNewDateTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Mueve la función aquí dentro
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setAvailableSlots([]);

    if (!date || !selectedEvent) return;

    setLoadingSlots(true);
    try {
      const slots = await fetchAvailableSlots({
        professionalId: selectedEvent.resource.professionalId,
        date: date,
        serviceId: selectedEvent.resource.serviceId,
        token,
      });
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Error al cargar los horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

const { data: appointments = [], isLoading, isError } = useQuery({
  queryKey: ['appointments', dateRange],
  queryFn: () => fetchAppointments(dateRange, token),
  enabled: !!dateRange.start && !!dateRange.end && !!token,
  staleTime: 2 * 60 * 1000, // 2 minutes
});

  // --- Mutación ---
  const rescheduleMutation = useMutation({
    mutationFn: updateAppointmentTime,
    onSuccess: () => {
      toast.success('Cita reprogramada exitosamente.');
      setRescheduleMode(false);
      setSelectedDate('');
      setSelectedSlot('');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'No se pudo reprogramar la cita.';
      toast.error(message);
    },
  });

  //  Ahora esta función está DENTRO del componente
  const handleReschedule = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Por favor selecciona una fecha y horario.');
      return;
    }

    const dateTimeCombined = new Date(`${selectedDate}T${selectedSlot}`);
    const confirmation = window.confirm(
      `¿Confirmar reprogramación para ${format(dateTimeCombined, 'PPPp', { locale: es })}?`
    );

    if (confirmation) {
      rescheduleMutation.mutate({
        id: selectedEvent.resource.id,
        newDateTime: dateTimeCombined.toISOString(),
        token,
      });
    }
  };

const cancelMutation = useMutation({
  mutationFn: cancelAppointmentById,
  onSuccess: () => {
    toast.success('Cita cancelada exitosamente.');
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    setIsModalOpen(false);
  },
  onError: (error) => {
    const message = error.response?.data?.message || 'Error al cancelar la cita.';
    toast.error(message);
  },
});

// --- Permisos y validaciones ---
const canReschedule = (event) => {
  if (!event?.resource) return false;

  const isAdminOrReceptionist = ['Admin', 'Recepcionista'].includes(user?.role);
  const isClientOwner = user?.role === 'Cliente' && event.resource?.pet?.ownerId === user?.id;
  const isScheduled = event.resource.status === 'Pagada';

  return isScheduled && (isAdminOrReceptionist || isClientOwner);
};

const canCancel = (event) => {
  if (!event?.resource) return false;

  const isAdminOrReceptionist = ['Admin', 'Recepcionista'].includes(user?.role);
  const isClientOwner = user?.role === 'Cliente' && event.resource?.pet?.ownerId === user?.id;
  const isProfessional = ['Veterinario', 'Groomer'].includes(user?.role) && event.resource.professionalId === user?.id;
  const isScheduled = event.resource.status === 'Pagada';

  return isScheduled && (isAdminOrReceptionist || isClientOwner || isProfessional);
};

const handleEventDrop = ({ event, start, end }) => {
  if (!canReschedule(event)) {
    toast.error('No tienes permiso para reprogramar esta cita.');
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    return;
  }

  if (window.confirm(`¿Reprogramar la cita de "${event.title}" a ${format(start, 'PPPp', { locale: es })}?`)) {
    rescheduleMutation.mutate({
      id: event.resource.id,
      newDateTime: start.toISOString(),
      token,
    });
  } else {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }
};

const handleSelectEvent = (event) => {
  setSelectedEvent(event);
  setRescheduleMode(false);
  setNewDateTime('');
  setIsModalOpen(true);
};

const handleCancel = () => {
  if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
    cancelMutation.mutate({ id: selectedEvent.resource.id, token });
  }
};
const events = useMemo(() =>
  appointments.map(app => ({
    id: app.id,
    title: `${app.service.name} - ${app.pet.name}`,
    start: new Date(app.dateTime),
    end: new Date(new Date(app.dateTime).getTime() + (app.service.duration || 30) * 60000),
    resource: app,
  })), [appointments]
);

// --- Render ---
if (isLoading) {
  return (
    <div className="flex justify-center items-center py-20 h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando citas...</p>
      </div>
    </div>
  );
}

if (isError) {
  return (
    <div className="flex justify-center items-center py-20 h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">Error al cargar las citas</p>
        <p className="text-red-600 text-sm mt-2">Por favor, intenta recargar la página.</p>
      </div>
    </div>
  );
}

return (
  <div className="p-6 bg-white rounded-lg shadow-lg" style={{ height: '85vh' }}>
    {/* --- Header --- */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
        <CalendarDays className="w-8 h-8 text-blue-600" />
        Calendario de Citas
      </h2>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={currentView === Views.MONTH ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView(Views.MONTH)}
        >
          Mes
        </Button>
        <Button
          variant={currentView === Views.WEEK ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView(Views.WEEK)}
        >
          Semana
        </Button>
        <Button
          variant={currentView === Views.DAY ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView(Views.DAY)}
        >
          Día
        </Button>
        <Button
          variant={currentView === Views.AGENDA ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView(Views.AGENDA)}
        >
          Agenda
        </Button>
      </div>
    </div>

    {/* --- Calendario --- */}
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      view={currentView}
      onView={setCurrentView}
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
      style={{ height: 'calc(100% - 80px)' }}
      onRangeChange={(range) => {
        const start = Array.isArray(range) ? range[0] : range.start;
        const end = Array.isArray(range) ? range[range.length - 1] : range.end;
        setDateRange({ start, end });
      }}
      onEventDrop={handleEventDrop}
      onSelectEvent={handleSelectEvent}
      eventPropGetter={(event) => {
        let backgroundColor = '#3174ad'; // Azul - Pagada

        if (event.resource.status === 'Completada') {
          backgroundColor = '#4caf50'; // Verde
        } else if (event.resource.status === 'Cancelada') {
          backgroundColor = '#e57373'; // Rojo
        } else if (event.resource.status === 'Pendiente de Cancelación') {
          backgroundColor = '#ff9800'; // Naranja
        }

        return {
          style: {
            backgroundColor,
            borderRadius: '8px',
            color: 'white',
            border: 'none',
            padding: '4px 6px',
            opacity: event.resource.status === 'Cancelada' ? 0.6 : 1,
          },
        };
      }}
      draggableAccessor={canReschedule}
      components={{
        toolbar: (toolbar) => (
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toolbar.onNavigate('PREV')}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toolbar.onNavigate('TODAY')}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toolbar.onNavigate('NEXT')}
                className="flex items-center gap-1"
              >
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

    {/* --- Modal de Detalles --- */}
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  {rescheduleMode ? 'Reprogramar Cita' : 'Detalles de la Cita'}
                </Dialog.Title>

                {selectedEvent && !rescheduleMode && (
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Servicio</p>
                      <p className="font-semibold text-gray-900">{selectedEvent.resource.service.name}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Mascota</p>
                      <p className="font-semibold text-gray-900">{selectedEvent.resource.pet.name}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Profesional</p>
                      <p className="font-semibold text-gray-900">
                        {selectedEvent.resource.professional.firstName} {selectedEvent.resource.professional.lastName}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Fecha y Hora</p>
                      <p className="font-semibold text-gray-900">
                        {format(selectedEvent.start, 'PPPp', { locale: es })}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Estado</p>
                      <span className={`inline-block font-semibold mt-1 px-3 py-1 rounded-full text-sm ${
                        selectedEvent.resource.status === 'Pagada' ? 'bg-blue-100 text-blue-800' :
                        selectedEvent.resource.status === 'Completada' ? 'bg-green-100 text-green-800' :
                        selectedEvent.resource.status === 'Cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedEvent.resource.status}
                      </span>
                    </div>
                  </div>
                )}

                {rescheduleMode && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selecciona una Fecha
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Horarios Disponibles
                        </label>
                        {loadingSlots ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                                  selectedSlot === slot
                                    ? 'border-blue-600 bg-blue-100 text-blue-800'
                                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-700">
                              No hay horarios disponibles para esta fecha.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        📅 {selectedDate && `${format(new Date(selectedDate), 'EEEE, d MMMM', { locale: es })}`}
                        {selectedSlot && ` a las ${selectedSlot}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {!rescheduleMode ? (
                    <>
                      {canReschedule(selectedEvent) && (
                        <Button
                          onClick={() => setRescheduleMode(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Reprogramar
                        </Button>
                      )}
                      {canCancel(selectedEvent) && (
                        <Button
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
                        >
                          {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Cita'}
                        </Button>
                      )}
                      <Button
                        onClick={() => setIsModalOpen(false)}
                        variant="outline"
                      >
                        Cerrar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleReschedule}
                        disabled={rescheduleMutation.isPending || !selectedDate || !selectedSlot}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                      >
                        {rescheduleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button
                        onClick={() => setRescheduleMode(false)}
                        variant="outline"
                        disabled={rescheduleMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  </div>
);
}
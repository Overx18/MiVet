import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, User, PawPrint, Stethoscope, X, MapPin, Phone, CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// --- Configuración de localización ---
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- Funciones API ---
const fetchAppointments = (range, token) => {
  const params = new URLSearchParams(range).toString();
  return apiClient
    .get(`/appointments?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data)
    .catch(() => []);
};

const updateAppointmentTime = ({ id, newDateTime, token }) =>
  apiClient.patch(`/appointments/${id}/reschedule`, { newDateTime }, {
    headers: { Authorization: `Bearer ${token}` },
  });

const cancelAppointmentById = ({ id, token }) =>
  apiClient.patch(`/appointments/${id}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` } 
  });

const getAvailableSlots = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/appointments/availability?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data || []);
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
      toast.success('Cita reprogramada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
      setShowRescheduleModal(false);
      resetRescheduleForm();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al reprogramar'),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointmentById,
    onSuccess: () => {
      toast.success('Cita cancelada correctamente');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al cancelar'),
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
      
      // --- Debug logs ---
      console.log('🔍 Debuggeo de horarios disponibles:');
      console.log('Fecha formateada:', formattedDate);
      console.log('ID del servicio:', serviceId);
      console.log('ID del profesional:', professionalId);
      console.log('Token:', token ? 'presente' : 'ausente');
      
      const slots = await getAvailableSlots(
        {
          professionalId,
          date: formattedDate,
          serviceId,
        },
        token
      );
      
      console.log('✅ Horarios recibidos:', slots);
      console.log('Tipo de dato:', typeof slots);
      console.log('¿Es array?:', Array.isArray(slots));
      
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('❌ Error en fetchAvailableSlots:', error);
      console.error('Mensaje:', error.message);
      console.error('Response:', error.response?.data);
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
    
    const isOwner = user.role === 'Cliente' && 
      appointment.pet?.owner?.id === user.id;
    
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
    
    const isOwner = user.role === 'Cliente' && 
      appointment.pet?.owner?.id === user.id;
    
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
    console.log('📋 Cita completa:', JSON.stringify(appointment, null, 2));
    console.log('📋 Abriendo modal de reprogramación para:', appointment);
    
    if (!canReschedule(appointment)) {
      const errorMsg = getRescheduleErrorMessage(appointment);
      console.warn('❌ No se puede reprogramar:', errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setSelectedAppointment(appointment);
    resetRescheduleForm();
    setShowRescheduleModal(true);
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    
    console.log('📅 Fecha seleccionada:', date);
    console.log('Cita seleccionada:', selectedAppointment);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      toast.error('No puedes seleccionar una fecha en el pasado.');
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(null);
    
    // Usar directamente los IDs del objeto raíz, no del nested
    const serviceId = selectedAppointment?.serviceId;
    const professionalId = selectedAppointment?.professionalId;
    
    console.log('🚀 IDs para horarios:', { serviceId, professionalId });
    
    if (serviceId && professionalId) {
      console.log('✅ Iniciando búsqueda de horarios...');
      fetchAvailableSlots(date, serviceId, professionalId);
    } else {
      console.warn('❌ Faltan IDs:', { serviceId, professionalId });
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pagada': 'bg-green-100 text-green-800 border-green-300',
      'Completada': 'bg-gray-100 text-gray-800 border-gray-300',
      'Cancelada': 'bg-red-100 text-red-800 border-red-300',
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Formatear eventos para el calendario
  const events = useMemo(() => appointments.map(app => ({
    title: `${app.service.name} - ${app.pet.name}`,
    start: new Date(app.dateTime),
    end: new Date(new Date(app.dateTime).getTime() + (app.service.duration || 30) * 60000),
    resource: app,
  })), [appointments]);

  // --- Componente Modal Reprogramación ---
  const RescheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Reprogramar Cita</h2>
          </div>
          <button 
            onClick={() => setShowRescheduleModal(false)} 
            className="hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Información de la cita actual */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold mb-2">Cita Actual:</p>
            <p className="text-sm font-bold text-gray-900">
              {format(new Date(selectedAppointment.dateTime), "dd/MM/yyyy HH:mm", { locale: es })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedAppointment.service?.name} - {selectedAppointment.pet?.name}
            </p>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nueva Fecha
            </label>
            <input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Selector de hora */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hora Disponible
              </label>
              
              {loadingSlots ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Cargando horarios disponibles...
                </p>
              ) : availableSlots.length > 0 ? (
                <select
                  value={selectedTime || ''}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecciona una hora</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-500 text-center py-4">
                  No hay horarios disponibles en esta fecha.
                </p>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmReschedule}
              disabled={rescheduleMutation.isPending || !selectedDate || !selectedTime}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition disabled:cursor-not-allowed"
            >
              {rescheduleMutation.isPending ? 'Reprogramando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Render ---
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg" style={{ height: '90vh' }}>
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
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          onView={view => setCurrentView(view)}
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
            setDateRange({ start: start.toISOString(), end: end.toISOString() });
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#3b82f6',
              borderRadius: '6px',
              opacity: 0.9,
              color: 'white',
              border: 'none',
              display: 'block',
              padding: '2px 4px',
              fontSize: '12px',
            },
          })}
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

      {/* Modal de Detalles */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-100 overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-6 h-6" />
                <h2 className="text-xl font-bold">Detalles de la Cita</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-700 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-600">Fecha y Hora</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {format(new Date(selectedAppointment.dateTime), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-600">Servicio</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedAppointment.service?.name}</p>
                  <p className="text-sm text-gray-500">Duración: {selectedAppointment.service?.duration} minutos</p>
                </div>
              </div>

              {/* Información del Cliente y Mascota */}
              <div className="grid grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-gray-600">Propietario</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedAppointment.pet?.owner?.firstName} {selectedAppointment.pet?.owner?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="w-4 h-4" /> {selectedAppointment.pet?.owner?.phone || 'N/A'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-semibold text-gray-600">Mascota</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedAppointment.pet?.name}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.pet.species.name || 'Especie no disponible'}</p>
                  </div>
              </div>

              {/* Información del Profesional */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-600">Profesional Asignado</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {selectedAppointment.professional?.firstName} {selectedAppointment.professional?.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedAppointment.professional?.role}</p>
              </div>

              {/* Estado y Pago */}
              <div className="grid grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Estado de Cita</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>

              </div>

              {/* Precio */}
              <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-700">Total a Pagar:</p>
                  <p className="text-2xl font-bold text-blue-600">S/ {parseFloat(selectedAppointment.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 border-t pt-6">
                {selectedAppointment.status === 'Pagada' && (
                  <>
                    <button
                      onClick={() => handleOpenRescheduleModal(selectedAppointment)}
                      disabled={rescheduleMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      Reprogramar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Cancelar esta cita?')) {
                          cancelMutation.mutate({ id: selectedAppointment.id, token });
                        }
                      }}
                      disabled={cancelMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reprogramación */}
      {showRescheduleModal && <RescheduleModal />}
    </div>
  );
}
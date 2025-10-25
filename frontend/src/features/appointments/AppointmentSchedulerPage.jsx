import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, PawPrint, Stethoscope, DollarSign } from 'lucide-react';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- API Functions ---
const fetchClients = (token) =>
  apiClient
    .get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data.users || []);

const fetchUserPets = (token) =>
  apiClient
    .get('/pets', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data.pets || []);

const fetchPetsByOwner = (ownerId, token) =>
  apiClient
    .get(`/pets?ownerId=${ownerId}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data.pets || []);

const fetchServices = (token) =>
  apiClient
    .get('/services', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data || []);

const fetchProfessionals = (type, token) =>
  apiClient
    .get(`/appointments/professionals?type=${type}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data || []);

const fetchAvailableSlots = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/appointments/availability?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data || []);
};

const scheduleAndCreateIntent = ({ appointmentData, token }) =>
  apiClient.post('/payments/schedule-and-pay', appointmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default function AppointmentSchedulerPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  // Determine user role
  const isReceptionistOrAdmin = user?.role === 'Recepcionista' || user?.role === 'Admin';

  // --- Form field watchers ---
  const selectedOwnerId = watch('ownerId');
  const selectedServiceId = watch('serviceId');
  const selectedProfessionalId = watch('professionalId');
  const selectedDate = watch('date');

  // --- Queries ---
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(token),
    enabled: isReceptionistOrAdmin && !!token,
  });

  const ownerToFetchPets = isReceptionistOrAdmin ? selectedOwnerId : user?.id;

  const { data: pets = [], isLoading: isLoadingPets } = useQuery({
    queryKey: ['petsByOwner', ownerToFetchPets],
    queryFn: () => fetchPetsByOwner(ownerToFetchPets, token),
    enabled: !!ownerToFetchPets && !!token,
  });

  const { data: myPets = [], isLoading: isLoadingMyPets } = useQuery({
    queryKey: ['myPets'],
    queryFn: () => fetchUserPets(token),
    enabled: !isReceptionistOrAdmin && !!token,
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchServices(token),
    enabled: !!token,
  });

  const selectedService = services?.find(s => s.id === selectedServiceId);

  const { data: professionals = [], isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ['professionals', selectedService?.type],
    queryFn: () => fetchProfessionals(selectedService.type, token),
    enabled: !!selectedService?.type && !!token,
  });

  const { data: availableSlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', selectedProfessionalId, selectedDate, selectedServiceId],
    queryFn: () =>
      fetchAvailableSlots(
        {
          professionalId: selectedProfessionalId,
          date: selectedDate,
          serviceId: selectedServiceId,
        },
        token
      ),
    enabled: !!selectedProfessionalId && !!selectedDate && !!selectedServiceId && !!token,
  });

  // --- Reset dependent fields ---
  useEffect(() => {
    setValue('petId', '');
  }, [selectedOwnerId, setValue]);

  useEffect(() => {
    if (selectedServiceId) {
      setValue('professionalId', '');
      setValue('date', '');
      setValue('time', '');
    }
  }, [selectedServiceId, setValue]);

  useEffect(() => {
    if (selectedProfessionalId) {
      setValue('date', '');
      setValue('time', '');
    }
  }, [selectedProfessionalId, setValue]);

  // --- Mutations ---
  const mutation = useMutation({
    mutationFn: scheduleAndCreateIntent,
    onSuccess: (response, variables) => {
      toast.success('✓ Horario validado. Redirigiendo al pago...');
      const { clientSecret } = response.data;
      const { appointmentData } = variables;

      navigate('/pay-appointment', {
        state: {
          clientSecret,
          appointmentData,
        },
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Error al validar la disponibilidad de la cita.'
      );
    },
  });

  // --- Form submission ---
  const onSubmit = (data) => {
    setIsLoading(true);
    const { date, time, ...rest } = data;
    const appointmentData = {
      ...rest,
      dateTime: `${date}T${time}:00`,
    };
    mutation.mutate({ appointmentData, token }, {
      onSettled: () => setIsLoading(false),
    });
  };

  const displayPets = isReceptionistOrAdmin ? pets : myPets;
  const isLoadingDisplayPets = isReceptionistOrAdmin ? isLoadingPets : isLoadingMyPets;
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <PawPrint className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Agendar Cita</h1>
          </div>
          <p className="text-gray-600 text-lg">Sistema de reservas veterinarias</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {/* Owner Selection (Receptionist/Admin only) */}
          {isReceptionistOrAdmin && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-indigo-600" />
                Propietario
              </label>
              <select
                {...register('ownerId', { required: 'Seleccione un propietario' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-gray-100"
              >
                <option value="">-- Seleccione un cliente --</option>
                {clients?.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              {errors.ownerId && (
                <p className="text-sm text-red-500 font-medium">{errors.ownerId.message}</p>
              )}
            </div>
          )}

          {/* Pet Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <PawPrint className="w-4 h-4 text-indigo-600" />
              Mascota
            </label>
            <select
              {...register('petId', { required: 'Seleccione una mascota' })}
              disabled={!ownerToFetchPets || isLoadingDisplayPets}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">-- Seleccione una mascota --</option>
              {isLoadingDisplayPets && <option>Cargando mascotas...</option>}
              {!isLoadingDisplayPets && displayPets?.length === 0 && (
                <option disabled>No hay mascotas disponibles</option>
              )}
              {displayPets?.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species?.name || 'Especie desconocida'})
                </option>
              ))}
            </select>
            {errors.petId && (
              <p className="text-sm text-red-500 font-medium">{errors.petId.message}</p>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              Servicio
            </label>
            <select
              {...register('serviceId', { required: 'Seleccione un servicio' })}
              disabled={isLoadingServices}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">-- Seleccione un servicio --</option>
              {isLoadingServices && <option>Cargando servicios...</option>}
              {!isLoadingServices && services?.length === 0 && (
                <option disabled>No hay servicios disponibles</option>
              )}
              {services?.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} (S/ {Number(service.price || 0).toFixed(2)})
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <p className="text-sm text-red-500 font-medium">{errors.serviceId.message}</p>
            )}
          </div>

          {/* Professional Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="w-4 h-4 text-indigo-600" />
              Profesional
            </label>
            <select
              {...register('professionalId', { required: 'Seleccione un profesional' })}
              disabled={!selectedServiceId || isLoadingProfessionals}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">-- Seleccione un profesional --</option>
              {isLoadingProfessionals && <option>Cargando profesionales...</option>}
              {!isLoadingProfessionals && professionals?.length === 0 && (
                <option disabled>No hay profesionales disponibles</option>
              )}
              {professionals?.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.firstName} {prof.lastName}
                </option>
              ))}
            </select>
            {errors.professionalId && (
              <p className="text-sm text-red-500 font-medium">{errors.professionalId.message}</p>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Fecha
              </label>
              <input
                type="date"
                {...register('date', { required: 'Seleccione una fecha' })}
                disabled={!selectedProfessionalId}
                min={minDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
              {errors.date && (
                <p className="text-sm text-red-500 font-medium">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-indigo-600" />
                Horario
              </label>
              <select
                {...register('time', { required: 'Seleccione un horario' })}
                disabled={isLoadingSlots || !availableSlots || availableSlots.length === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="">-- Seleccione horario --</option>
                {isLoadingSlots && <option>Cargando horarios...</option>}
                {!isLoadingSlots && availableSlots?.length === 0 && (
                  <option disabled>No hay horarios disponibles</option>
                )}
                {availableSlots?.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-sm text-red-500 font-medium">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Information Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <span className="text-lg mt-0.5">ℹ️</span>
              <span>
                <strong>Nota:</strong> El horario es referencial. Se recomienda llegar 30 minutos
                antes de la hora agendada.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || mutation.isPending}
            className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <DollarSign className="w-5 h-5" />
            {isLoading || mutation.isPending ? 'Validando disponibilidad...' : 'Proceder al Pago'}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Problemas? Contacte a nuestro equipo de soporte
        </p>
      </div>
    </div>
  );
}
// frontend/src/features/appointments/AppointmentSchedulerPage.jsx
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- Funciones de API ---
// Corregido: La API devuelve { data: [...] }, no { pets: [...] }
const fetchUserPets = (token) =>
  apiClient
    .get('/pets', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data.pets || []);
const fetchServices = (token) => apiClient.get('/services', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
const fetchProfessionals = (type, token) => apiClient.get(`/appointments/professionals?type=${type}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
// Añadida: Función para obtener horarios
const fetchAvailableSlots = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient.get(`/appointments/availability?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};
const createAppointment = ({ appointmentData, token }) => apiClient.post('/appointments', appointmentData, { headers: { Authorization: `Bearer ${token}` } });

export default function AppointmentSchedulerPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();

  // --- Observar cambios en los campos del formulario ---
  const selectedServiceId = watch('serviceId');
  const selectedProfessionalId = watch('professionalId');
  const selectedDate = watch('date'); // Campo de fecha separado

  // --- Queries para obtener datos ---
  const { data: pets } = useQuery({ queryKey: ['myPets'], queryFn: () => fetchUserPets(token), enabled: !!token });
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: () => fetchServices(token), enabled: !!token });
  
  const selectedService = services?.find(s => s.id === selectedServiceId);

  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ['professionals', selectedService?.type],
    queryFn: () => fetchProfessionals(selectedService.type, token),
    enabled: !!selectedService?.type,
  });

  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', selectedProfessionalId, selectedDate, selectedServiceId],
    queryFn: () => fetchAvailableSlots({ professionalId: selectedProfessionalId, date: selectedDate, serviceId: selectedServiceId }, token),
    enabled: !!selectedProfessionalId && !!selectedDate && !!selectedServiceId,
  });

  // --- Efectos para resetear campos dependientes ---
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

  // --- Mutación para crear la cita ---
  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      toast.success('Cita programada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al programar la cita.'),
  });

  const onSubmit = (data) => {
    const { date, time, ...rest } = data;
    const appointmentData = {
      ...rest,
      dateTime: `${date}T${time}:00`, // Combinar fecha y hora
    };
    mutation.mutate({ appointmentData, token });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Programar Nueva Cita</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Selección de Mascota */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mascota</label>
          <select {...register('petId', { required: 'Seleccione una mascota' })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">-- Mis Mascotas --</option>
            {pets?.map(pet => <option key={pet.id} value={pet.id}>{pet.name} ({pet.Species?.name})</option>)}
          </select>
          {errors.petId && <p className="text-sm text-red-600 mt-1">{errors.petId.message}</p>}
        </div>

        {/* Selección de Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Servicio</label>
          <select {...register('serviceId', { required: 'Seleccione un servicio' })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">-- Servicios Disponibles --</option>
            {services?.map(service => <option key={service.id} value={service.id}>{service.name} (S/ {service.price})</option>)}
          </select>
          {errors.serviceId && <p className="text-sm text-red-600 mt-1">{errors.serviceId.message}</p>}
        </div>

        {/* Selección de Profesional */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profesional</label>
          <select {...register('professionalId', { required: 'Seleccione un profesional' })} disabled={!selectedServiceId || isLoadingProfessionals} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
            <option value="">-- Profesionales Disponibles --</option>
            {professionals?.map(prof => <option key={prof.id} value={prof.id}>{prof.firstName} {prof.lastName}</option>)}
          </select>
          {errors.professionalId && <p className="text-sm text-red-600 mt-1">{errors.professionalId.message}</p>}
        </div>

        {/* Selección de Fecha y Hora (Separados) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" {...register('date', { required: 'Seleccione una fecha' })} disabled={!selectedProfessionalId} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" min={new Date().toISOString().split('T')[0]} />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horario Disponible</label>
            <select {...register('time', { required: 'Seleccione un horario' })} disabled={isLoadingSlots || !availableSlots} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
              <option value="">-- Horarios --</option>
              {isLoadingSlots && <option>Cargando...</option>}
              {availableSlots && availableSlots.length === 0 && <option>No hay horarios</option>}
              {availableSlots?.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>}
          </div>
        </div>
        
        <p className="text-sm text-red-600 text-center">
            *Es horario referencial, se recomienda llegar 30 min antes de la hora agendada.*
        </p>
        
        <button type="submit" disabled={mutation.isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {mutation.isPending ? 'Programando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );
}
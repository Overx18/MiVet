import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  LocalHospital as LocalHospitalIcon,
  AccessTime as AccessTimeIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// --- API Functions ---
const fetchClients = (token) =>
  apiClient
    .get('/users?role=Cliente', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.users || []);

const fetchUserPets = (token) =>
  apiClient
    .get('/pets', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.pets || []);

const fetchPetsByOwner = (ownerId, token) =>
  apiClient
    .get(`/pets?ownerId=${ownerId}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.pets || []);

const fetchServices = (token) =>
  apiClient
    .get('/services', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data || []);

const fetchProfessionals = (type, token) =>
  apiClient
    .get(`/appointments/professionals?type=${type}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data || []);

const fetchAvailableSlots = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/appointments/availability?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data || []);
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ownerId: '',
      petId: '',
      serviceId: '',
      professionalId: '',
      date: '',
      time: '',
    },
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Determine user role
  const isReceptionistOrAdmin =
    user?.role === 'Recepcionista' || user?.role === 'Admin';

  // --- Form field watchers ---
  const selectedOwnerId = watch('ownerId');
  const selectedServiceId = watch('serviceId');
  const selectedProfessionalId = watch('professionalId');
  const selectedDate = watch('date');
  const selectedPetId = watch('petId');

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

  const selectedService = services?.find((s) => s.id === selectedServiceId);

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

      navigate('/appointments/pay', {
        state: {
          clientSecret,
          appointmentData: response.data.appointmentData,
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

  // Pasos del wizard
  const steps = ['Mascota', 'Servicio', 'Profesional', 'Fecha y Hora'];

  // Validar si cada paso está completo
  const isStep0Complete = isReceptionistOrAdmin ? !!selectedOwnerId && !!selectedPetId : !!selectedPetId;
  const isStep1Complete = !!selectedServiceId;
  const isStep2Complete = !!selectedProfessionalId;
  const isStep3Complete = !!selectedDate && !!watch('time');

  const canProceed = [isStep0Complete, isStep1Complete, isStep2Complete, isStep3Complete][activeStep];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Obtener datos seleccionados para resumen
  const selectedPetData = displayPets?.find((p) => p.id === selectedPetId);
  const selectedServiceData = services?.find((s) => s.id === selectedServiceId);
  const selectedProfessionalData = professionals?.find((p) => p.id === selectedProfessionalId);
  const selectedClientData = clients?.find((c) => c.id === selectedOwnerId);

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginBottom: 1 }}>
          <EventAvailableIcon sx={{ fontSize: 32, color: '#1E40AF' }} />
          <Typography
            variant="h1"
            sx={{
              color: '#1F2937',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
            }}
          >
            Agendar Cita
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Sistema de reservas veterinarias
        </Typography>
      </Box>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Stepper */}
        <Box sx={{ padding: 3, backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Form Content */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ padding: 4 }}>
          {/* Info Alert */}
          <Alert severity="info" sx={{ marginBottom: 3, borderRadius: 1 }}>
            <Typography variant="body2">
              Paso {activeStep + 1} de {steps.length}: <strong>{steps[activeStep]}</strong>
            </Typography>
          </Alert>

          {/* Step 0: Owner (if receptionist) and Pet Selection */}
          {activeStep === 0 && (
            <Box sx={{ space: 3 }}>
              {/* Owner Selection (Receptionist/Admin only) */}
              {isReceptionistOrAdmin && (
                <Controller
                  name="ownerId"
                  control={control}
                  rules={{ required: 'Seleccione un propietario' }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.ownerId}
                      sx={{ marginBottom: 3 }}
                    >
                      <InputLabel>Propietario *</InputLabel>
                      <Select
                        {...field}
                        label="Propietario *"
                        startAdornment={<PersonIcon sx={{ marginRight: 1, color: '#1E40AF' }} />}
                      >
                        <MenuItem value="">
                          <em>Seleccione un cliente</em>
                        </MenuItem>
                        {clients?.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ownerId && (
                        <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                          {errors.ownerId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              )}

              {/* Pet Selection */}
              <Controller
                name="petId"
                control={control}
                rules={{ required: 'Seleccione una mascota' }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.petId}
                    disabled={!ownerToFetchPets || isLoadingDisplayPets}
                  >
                    <InputLabel>Mascota *</InputLabel>
                    <Select
                      {...field}
                      label="Mascota *"
                    >
                      <MenuItem value="">
                        <em>Seleccione una mascota</em>
                      </MenuItem>
                      {isLoadingDisplayPets && (
                        <MenuItem disabled>Cargando mascotas...</MenuItem>
                      )}
                      {!isLoadingDisplayPets && displayPets?.length === 0 && (
                        <MenuItem disabled>No hay mascotas disponibles</MenuItem>
                      )}
                      {displayPets?.map((pet) => (
                        <MenuItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species?.name || 'Especie desconocida'})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.petId && (
                      <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                        {errors.petId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          )}

          {/* Step 1: Service Selection */}
          {activeStep === 1 && (
            <Controller
              name="serviceId"
              control={control}
              rules={{ required: 'Seleccione un servicio' }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.serviceId}
                  disabled={isLoadingServices}
                >
                  <InputLabel>Servicio *</InputLabel>
                  <Select
                    {...field}
                    label="Servicio *"
                  >
                    <MenuItem value="">
                      <em>Seleccione un servicio</em>
                    </MenuItem>
                    {isLoadingServices && (
                      <MenuItem disabled>Cargando servicios...</MenuItem>
                    )}
                    {!isLoadingServices && services?.length === 0 && (
                      <MenuItem disabled>No hay servicios disponibles</MenuItem>
                    )}
                    {services?.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - S/ {Number(service.price || 0).toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.serviceId && (
                    <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                      {errors.serviceId.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Step 2: Professional Selection */}
          {activeStep === 2 && (
            <Controller
              name="professionalId"
              control={control}
              rules={{ required: 'Seleccione un profesional' }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.professionalId}
                  disabled={!selectedServiceId || isLoadingProfessionals}
                >
                  <InputLabel>Profesional *</InputLabel>
                  <Select
                    {...field}
                    label="Profesional *"
                  >
                    <MenuItem value="">
                      <em>Seleccione un profesional</em>
                    </MenuItem>
                    {isLoadingProfessionals && (
                      <MenuItem disabled>Cargando profesionales...</MenuItem>
                    )}
                    {!isLoadingProfessionals && professionals?.length === 0 && (
                      <MenuItem disabled>No hay profesionales disponibles</MenuItem>
                    )}
                    {professionals?.map((prof) => (
                      <MenuItem key={prof.id} value={prof.id}>
                        {prof.firstName} {prof.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.professionalId && (
                    <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                      {errors.professionalId.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Step 3: Date and Time Selection */}
          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Seleccione una fecha' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha *"
                      type="date"
                      fullWidth
                      variant="outlined"
                      error={!!errors.date}
                      helperText={errors.date?.message}
                      disabled={!selectedProfessionalId}
                      inputProps={{
                        min: minDate,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="time"
                  control={control}
                  rules={{ required: 'Seleccione un horario' }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.time}
                      disabled={isLoadingSlots || !availableSlots || availableSlots.length === 0}
                    >
                      <InputLabel>Horario *</InputLabel>
                      <Select
                        {...field}
                        label="Horario *"
                      >
                        <MenuItem value="">
                          <em>Seleccione horario</em>
                        </MenuItem>
                        {isLoadingSlots && (
                          <MenuItem disabled>Cargando horarios...</MenuItem>
                        )}
                        {!isLoadingSlots && availableSlots?.length === 0 && (
                          <MenuItem disabled>No hay horarios disponibles</MenuItem>
                        )}
                        {availableSlots?.map((slot) => (
                          <MenuItem key={slot} value={slot}>
                            {slot}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.time && (
                        <Typography variant="caption" sx={{ color: '#DC2626', marginTop: 0.5 }}>
                          {errors.time.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Summary Card (visible on last step) */}
          {activeStep === 3 && (
            <Paper
              sx={{
                padding: 3,
                marginTop: 4,
                marginBottom: 3,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E5E7EB',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2, color: '#1F2937' }}>
                📋 Resumen de tu Cita
              </Typography>

              <Box sx={{ space: 2 }}>
                {selectedClientData && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Propietario:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedClientData.firstName} {selectedClientData.lastName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Mascota:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedPetData?.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Servicio:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedServiceData?.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Profesional:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedProfessionalData?.firstName} {selectedProfessionalData?.lastName}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Fecha:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedDate}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Hora:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {watch('time')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    Precio:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                    S/ {Number(selectedServiceData?.price || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Information Banner */}
          <Alert severity="warning" sx={{ marginTop: 3, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> El horario es referencial. Se recomienda llegar 30 minutos antes de la hora agendada.
            </Typography>
          </Alert>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2, marginTop: 4, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isLoading}
              startIcon={<NavigateBeforeIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Anterior
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                endIcon={<NavigateNextIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={!isStep3Complete || isLoading || mutation.isPending}
                startIcon={
                  isLoading || mutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {isLoading || mutation.isPending ? 'Validando...' : 'Proceder al Pago'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Footer Note */}
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ textAlign: 'center', marginTop: 3 }}
      >
        ¿Problemas? Contacte a nuestro equipo de soporte
      </Typography>
    </Container>
  );
}
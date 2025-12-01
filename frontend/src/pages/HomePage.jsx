// frontend/src/pages/HomePage.jsx
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Vaccines as VaccinesIcon,
  MedicalServices as MedicalIcon,
  Spa as SpaIcon,
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../api/axios';
import { useAuthStore } from '../store/auth.store';

// Imágenes del carrusel (puedes reemplazar con rutas reales)
const carouselImages = [
  { src: './images/hero-pets-1.jpg', alt: 'Mascota feliz en consulta', title: 'Cuidado Integral para tu Mascota' },
  { src: './images/hero-pets-2.jpg', alt: 'Veterinario con perro', title: 'Profesionales de Confianza' },
  { src: './images/hero-pets-3.jpg', alt: 'Gato en grooming', title: 'Servicios de Grooming Premium' },
];

// Servicios destacados
const featuredServices = [
  { icon: <MedicalIcon sx={{ fontSize: 48, color: '#3F51B5' }} />, title: 'Consultas Médicas', description: 'Atención veterinaria profesional para todas las especies' },
  { icon: <VaccinesIcon sx={{ fontSize: 48, color: '#3F51B5' }} />, title: 'Vacunación', description: 'Esquemas de vacunación completos y personalizados' },
  { icon: <SpaIcon sx={{ fontSize: 48, color: '#3F51B5' }} />, title: 'Grooming', description: 'Estética y cuidado profesional para tu mascota' },
  { icon: <PetsIcon sx={{ fontSize: 48, color: '#3F51B5' }} />, title: 'Cirugías', description: 'Procedimientos quirúrgicos con equipamiento de última generación' },
];

// Función para enviar mensaje de contacto
const sendContactMessage = (data) => apiClient.post('/contact', data);

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const contactMutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      toast.success('Mensaje enviado exitosamente. Te contactaremos pronto.');
      setContactForm({ name: '', email: '', message: '' });
    },
    onError: () => toast.error('Error al enviar el mensaje. Inténtalo nuevamente.'),
  });

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }
    contactMutation.mutate(contactForm);
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section con Carrusel */}
      <Box sx={{ position: 'relative', height: { xs: '400px', md: '600px' }, overflow: 'hidden' }}>
        {carouselImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: `linear-gradient(rgba(63, 81, 181, 0.3), rgba(63, 81, 181, 0.5)), url(${image.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {image.title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#E8EAF6',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.5rem' },
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Sistema de gestión veterinaria con tecnología de vanguardia
              </Typography>
              {isAuthenticated ? (
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    startIcon={<DashboardIcon />}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: '#3F51B5',
                      '&:hover': { backgroundColor: '#303F9F' },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Ir al Dashboard
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/appointments/new"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF',
                      '&:hover': { borderColor: '#E8EAF6', backgroundColor: 'rgba(255,255,255,0.1)' },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Agendar Cita
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: '#3F51B5',
                      '&:hover': { backgroundColor: '#303F9F' },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Registrarse
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF',
                      '&:hover': { borderColor: '#E8EAF6', backgroundColor: 'rgba(255,255,255,0.1)' },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </Box>
              )}
            </Container>
          </Box>
        ))}

        {/* Controles del Carrusel */}
        <IconButton
          onClick={handlePrevSlide}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={handleNextSlide}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* Indicadores */}
        <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
          {carouselImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? '#3F51B5' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Servicios Destacados */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            color: '#212121',
            mb: 1,
          }}
        >
          Nuestros Servicios
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#757575',
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Ofrecemos atención integral para tu mascota con profesionales altamente capacitados
        </Typography>

        <Grid container spacing={4}>
          {featuredServices.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: '#E8EAF6',
                  boxShadow: 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 16px rgba(63, 81, 181, 0.15)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{service.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  {service.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Formulario de Contacto */}
      <Box sx={{ backgroundColor: '#E8EAF6', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: '#212121',
              mb: 1,
            }}
          >
            Contáctanos
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#757575',
              mb: 4,
            }}
          >
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </Typography>

          <Paper sx={{ p: 4, backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
            <form onSubmit={handleContactSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mensaje"
                    multiline
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={contactMutation.isPending}
                    sx={{
                      backgroundColor: '#3F51B5',
                      '&:hover': { backgroundColor: '#303F9F' },
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    {contactMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Información de Contacto */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ color: '#3F51B5', fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    contacto@mivet.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon sx={{ color: '#3F51B5', fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    +51 999 888 777
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon sx={{ color: '#3F51B5', fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                    Ubicación
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Av. Principal 123, Lima
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
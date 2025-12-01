// frontend/src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 4, md: 6 },
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            border: '1px solid #E5E7EB',
          }}
        >
          {/* Icono de búsqueda no encontrada */}
          <Box sx={{ marginBottom: 3 }}>
            <SearchOffIcon
              sx={{
                fontSize: 120,
                color: '#3F51B5',
                opacity: 0.6,
              }}
            />
          </Box>

          {/* Código de error */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 700,
              color: '#3F51B5',
              marginBottom: 2,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          {/* Mensaje principal */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              marginBottom: 1,
            }}
          >
            Página no encontrada
          </Typography>

          {/* Mensaje secundario */}
          <Typography
            variant="body1"
            sx={{
              color: '#6B7280',
              marginBottom: 4,
              maxWidth: 400,
              marginX: 'auto',
            }}
          >
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
            Verifica la URL o regresa al inicio.
          </Typography>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                backgroundColor: '#3F51B5',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 600,
                paddingX: 4,
                paddingY: 1.5,
                '&:hover': {
                  backgroundColor: '#303F9F',
                },
              }}
            >
              Ir al Inicio
            </Button>

            <Button
              variant="outlined"
              onClick={handleGoBack}
              sx={{
                borderColor: '#3F51B5',
                color: '#3F51B5',
                textTransform: 'none',
                fontWeight: 600,
                paddingX: 4,
                paddingY: 1.5,
                '&:hover': {
                  borderColor: '#303F9F',
                  backgroundColor: 'rgba(63, 81, 181, 0.04)',
                },
              }}
            >
              Volver Atrás
            </Button>
          </Box>

          {/* Sugerencia de búsqueda */}
          <Box sx={{ marginTop: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                fontSize: '0.875rem',
              }}
            >
              Si crees que esto es un error, por favor contacta al{' '}
              <Typography
                component="span"
                sx={{
                  color: '#3F51B5',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => navigate('/')}
              >
                soporte técnico
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
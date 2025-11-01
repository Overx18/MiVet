import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1E40AF',
      light: '#3B82F6',
      lighter: '#60A5FA',
      dark: '#1E3A8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F766E',
      light: '#14B8A6',
      dark: '#0D5A52',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#991B1B',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#92400E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#065F46',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1E40AF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
      marginBottom: '0.5rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.25px',
      marginBottom: '0.5rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5rem',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.3px',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#1E40AF',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1E3A8A',
          },
          '&:active': {
            backgroundColor: '#1E3A8A',
          },
        },
        outlined: {
          borderColor: '#E5E7EB',
          color: '#1E40AF',
          border: '1.5px solid #E5E7EB',
          '&:hover': {
            backgroundColor: 'rgba(30, 64, 175, 0.04)',
            borderColor: '#1E40AF',
          },
        },
        text: {
          color: '#1E40AF',
          '&:hover': {
            backgroundColor: 'rgba(30, 64, 175, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#E5E7EB',
            },
            '&:hover fieldset': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1E40AF',
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input': {
            color: '#1F2937',
            fontSize: '0.95rem',
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#9CA3AF',
            opacity: 1,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(30, 64, 175, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(30, 64, 175, 0.12)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          fontWeight: 500,
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: '#1E40AF',
        },
        standardSuccess: {
          backgroundColor: 'rgba(5, 150, 105, 0.08)',
          borderColor: 'rgba(5, 150, 105, 0.3)',
          color: '#065F46',
        },
        standardWarning: {
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          borderColor: 'rgba(217, 119, 6, 0.3)',
          color: '#92400E',
        },
        standardError: {
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          borderColor: 'rgba(220, 38, 38, 0.3)',
          color: '#991B1B',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E40AF',
          color: '#FFFFFF',
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
        },
        bar: {
          backgroundColor: '#1E40AF',
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          color: '#1E40AF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E5E7EB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 1024,
      lg: 1280,
      xl: 1536,
    },
  },
});
import { useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ShoppingCart as POSIcon,
  Logout as LogoutIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorUserMenu, setAnchorUserMenu] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenUserMenu = (e) => {
    setAnchorUserMenu(e.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorUserMenu(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const getMenuLinks = () => {
    if (!isAuthenticated) return [];

    const links = [
      { label: 'Mascotas', icon: <PetsIcon />, path: '/pets', roles: ['Cliente', 'Recepcionista', 'Veterinario', 'Groomer', 'Admin'] },
      { label: 'Registrar Mascota', icon: <PetsIcon />, path: '/pets/register', roles: ['Cliente', 'Recepcionista'] },
      { label: 'Programar Cita', icon: <CalendarIcon />, path: '/appointments/new', roles: ['Cliente', 'Recepcionista'] },
      { label: 'Calendario', icon: <CalendarIcon />, path: '/appointments/calendar', roles: ['Cliente', 'Recepcionista', 'Veterinario', 'Groomer', 'Admin'] },
      { label: 'Inventario', icon: <InventoryIcon />, path: '/inventory', roles: ['Admin', 'Recepcionista', 'Veterinario'] },
      { label: 'Registrar Producto', icon: <InventoryIcon />, path: '/inventory/products/new', roles: ['Admin', 'Recepcionista'] },
      { label: 'Punto de Venta', icon: <POSIcon />, path: '/pos', roles: ['Admin', 'Recepcionista'] },
      { label: 'Usuarios', icon: <PeopleIcon />, path: '/admin/users', roles: ['Admin'] },
      { label: 'Especies', icon: <PetsIcon />, path: '/admin/species', roles: ['Admin'] },
      { label: 'Servicios', icon: <SettingsIcon />, path: '/admin/services', roles: ['Admin'] },
    ];

    return links.filter((link) => link.roles.includes(user?.role));
  };

  const menuLinks = getMenuLinks();

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box
        sx={{
          padding: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1E40AF',
            fontSize: '1.25rem',
          }}
        >
          MiVet
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      {isAuthenticated && (
        <>
          <List sx={{ paddingY: 2 }}>
            {menuLinks.map((link) => (
              <ListItem
                button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                sx={{
                  marginX: 1,
                  marginY: 0.5,
                  borderRadius: 1,
                  color: '#1F2937',
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(30, 64, 175, 0.08)',
                    color: '#1E40AF',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#1E40AF', minWidth: 40 }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: '#E5E7EB' }} />
          <List sx={{ paddingY: 2 }}>
            <ListItem
              button
              onClick={() => {
                handleNavigation('/profile');
                handleCloseUserMenu();
              }}
              sx={{
                marginX: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1E40AF', minWidth: 40 }}>
                <ProfileIcon />
              </ListItemIcon>
              <ListItemText primary="Mi Perfil" />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                marginX: 1,
                borderRadius: 1,
                color: '#DC2626',
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#DC2626', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', paddingX: { xs: 2, md: 3 } }}>
          {/* Logo */}
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1E40AF',
              textDecoration: 'none',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            MiVet
          </Typography>

          {/* Menú Desktop */}
          {!isMobile && isAuthenticated && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                flexWrap: 'wrap',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              {menuLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  size="small"
                  sx={{
                    color: '#1F2937',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                      color: '#1E40AF',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Área derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAuthenticated ? (
              <>
                {/* Menú Usuario */}
                <Button
                  onClick={handleOpenUserMenu}
                  sx={{
                    textTransform: 'none',
                    color: '#1F2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '8px 16px',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: '#1E40AF',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                  {!isMobile && (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.firstName}
                    </Typography>
                  )}
                </Button>

                <Menu
                  anchorEl={anchorUserMenu}
                  open={Boolean(anchorUserMenu)}
                  onClose={handleCloseUserMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                      Rol: {user?.role}
                    </Typography>
                  </MenuItem>
                  <Divider sx={{ borderColor: '#E5E7EB' }} />
                  <MenuItem
                    onClick={() => {
                      handleNavigation('/profile');
                      handleCloseUserMenu();
                    }}
                  >
                    <ProfileIcon sx={{ marginRight: 1.5, color: '#1E40AF' }} />
                    <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
                      Mi Perfil
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ marginRight: 1.5, color: '#DC2626' }} />
                    <Typography sx={{ color: '#DC2626', fontWeight: 500 }}>
                      Cerrar Sesión
                    </Typography>
                  </MenuItem>
                </Menu>

                {/* Botón menú móvil */}
                {isMobile && (
                  <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ color: '#1F2937' }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    textTransform: 'none',
                    color: '#1F2937',
                    fontWeight: 500,
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Registrarse
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, paddingY: 4, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
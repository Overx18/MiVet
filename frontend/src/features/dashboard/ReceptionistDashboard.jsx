// frontend/src/features/dashboard/ReceptionistDashboard.jsx
import { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Box, 
  Button, 
  Paper, 
  Chip, 
  Alert,
  Tab,
  Tabs,
  Divider,
  IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import StatCard from '../../components/ui/StatCard';

export default function ReceptionistDashboard({ data, user }) {
  const [tabValue, setTabValue] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => `S/ ${parseFloat(amount).toFixed(2)}`;

  const stats = data?.stats || {};
  const todayAppointments = data?.todayAppointments || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const pendingPayments = data?.pendingPayments || [];
  const recentSales = data?.recentSales || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <WelcomeHeader user={user} />

      {/* Alert Informativo */}
      <Alert severity="info" icon={<EventIcon />} sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>📋 Panel de Recepción:</strong> Gestiona citas, controla pagos y supervisa el inventario.
        </Typography>
      </Alert>

      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Citas Pendientes" 
            value={stats.pendingAppointmentsCount || 0}
            icon={EventIcon} 
            color="#3F51B5"
            subtitle="Programadas y confirmadas"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Citas de Hoy" 
            value={stats.todayAppointmentsCount || 0}
            icon={ScheduleIcon} 
            color="#059669"
            subtitle={`${stats.completedPaymentsToday || 0} pagadas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Stock Bajo" 
            value={stats.lowStockCount || 0}
            icon={WarningIcon} 
            color="#F59E0B"
            subtitle={`${stats.criticalStockCount || 0} críticos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pagos Pendientes" 
            value={stats.pendingPaymentsCount || 0}
            icon={PaymentIcon} 
            color={stats.pendingPaymentsCount > 0 ? "#EF4444" : "#10B981"}
            subtitle="Requieren atención"
          />
        </Grid>
      </Grid>

      {/* Tabs de Contenido */}
      <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#6B7280',
              '&.Mui-selected': {
                color: '#3F51B5',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#3F51B5',
            },
          }}
        >
          <Tab label="Citas de Hoy" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Pagos Pendientes" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Stock Bajo" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Ventas Recientes" icon={<ShoppingCartIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 1: Citas de Hoy */}
          {tabValue === 0 && (
            <Box>
              {todayAppointments.length > 0 ? (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {todayAppointments.map((app) => (
                    <Paper
                      key={app.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                          src={app.pet.photoUrl}
                          sx={{ width: 56, height: 56, backgroundColor: '#EFF6FF' }}
                        >
                          <PetsIcon sx={{ color: '#3F51B5' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                            {app.pet.name} - {app.service.name}
                          </Typography>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Cliente
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {app.client.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Hora
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatTime(app.dateTime)} ({app.service.duration} min)
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                                <Typography variant="body2">
                                  {app.client.phone}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                  Profesional:
                                </Typography>
                                <Chip
                                  label={`${app.professional.name} (${app.professional.role})`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={app.status}
                                  color={app.status === 'Pagada' ? 'success' : 'warning'}
                                  size="small"
                                />
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#059669' }}>
                                  {formatCurrency(app.service.price)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <EventIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                    No hay citas programadas para hoy
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Revisa el calendario para próximas citas
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 2: Pagos Pendientes */}
          {tabValue === 1 && (
            <Box>
              {pendingPayments.length > 0 ? (
                <>
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>⚠️ Atención:</strong> Hay {pendingPayments.length} cita{pendingPayments.length !== 1 ? 's' : ''} con pago pendiente.
                    </Typography>
                  </Alert>
                  <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {pendingPayments.map((payment) => (
                      <ListItem
                        key={payment.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid #FED7AA',
                          backgroundColor: '#FEF3C7',
                          '&:hover': {
                            backgroundColor: '#FDE68A',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#F59E0B' }}>
                            <PaymentIcon sx={{ color: '#FFFFFF' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                              {payment.pet} - {payment.service}
                            </Typography>
                          }
                          secondary={
                            <Box component="span">
                              <Typography component="span" variant="caption" color="textSecondary" display="block">
                                Cliente: {payment.client.name} | {payment.client.phone}
                              </Typography>
                              <Typography component="span" variant="caption" color="textSecondary" display="block">
                                Fecha: {formatDate(payment.date)}
                              </Typography>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#DC2626' }}>
                            {formatCurrency(payment.amount)}
                          </Typography>
                          <Button
                            component={Link}
                            to={`/appointments/pay?appointmentId=${payment.id}`}
                            size="small"
                            variant="contained"
                            sx={{
                              mt: 1,
                              textTransform: 'none',
                              backgroundColor: '#DC2626',
                              '&:hover': {
                                backgroundColor: '#B91C1C',
                              },
                            }}
                          >
                            Cobrar
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    ✓ No hay pagos pendientes
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 3: Stock Bajo */}
          {tabValue === 2 && (
            <Box>
              {lowStockProducts.length > 0 ? (
                <>
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>📦 Inventario:</strong> {stats.criticalStockCount} producto{stats.criticalStockCount !== 1 ? 's' : ''} en estado crítico (menos de 5 unidades).
                    </Typography>
                  </Alert>
                  <List disablePadding>
                    {lowStockProducts.map((product, index) => (
                      <Box key={product.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                backgroundColor: product.isCritical ? '#FEE2E2' : '#FEF3C7',
                              }}
                            >
                              <InventoryIcon sx={{ color: product.isCritical ? '#DC2626' : '#F59E0B' }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                            }
                            secondary={
                              <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={`${product.quantity} unidades`}
                                  size="small"
                                  color={product.isCritical ? 'red' : 'black'}
                                />
                                <Chip
                                  label={formatCurrency(product.price)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'span' }}
                          />
                        </ListItem>
                        {index < lowStockProducts.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                  <Button
                    component={Link}
                    to="/inventory"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Ver Inventario Completo
                  </Button>
                </>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    ✓ Inventario en buen estado
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 4: Ventas Recientes */}
          {tabValue === 3 && (
            <Box>
              {recentSales.length > 0 ? (
                <List disablePadding>
                  {recentSales.map((sale, index) => (
                    <Box key={sale.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#D1FAE5' }}>
                            <ShoppingCartIcon sx={{ color: '#059669' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {sale.client}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Typography component="span" variant="caption" color="textSecondary">
                                {formatDate(sale.date)}
                              </Typography>
                              <Chip
                                label={sale.paymentMethod || 'Efectivo'}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#059669' }}>
                          {formatCurrency(sale.amount)}
                        </Typography>
                      </ListItem>
                      {index < recentSales.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    No hay ventas recientes
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
}
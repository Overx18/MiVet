// frontend/src/features/reports/ReportsPage.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Typography, Card, CardContent, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider
} from '@mui/material';
import { Download as DownloadIcon, Assessment as AssessmentIcon, TrendingUp as TrendingUpIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const REPORT_TYPES = [
  { value: 'income', label: 'Reporte de Ingresos', requiresDates: true },
  { value: 'appointments', label: 'Reporte de Citas Atendidas', requiresDates: true },
  { value: 'inventory', label: 'Reporte de Inventario', requiresDates: false },
  { value: 'users', label: 'Reporte de Usuarios Activos', requiresDates: false },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const downloadReport = async ({ type, startDate, endDate, format, token }) => {
  const params = new URLSearchParams({ format });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get(`/reports/${type}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: format === 'json' ? 'json' : 'blob',
  });

  return { data: response.data, format };
};

// Componente para renderizar reportes de ingresos
function IncomeReportView({ data }) {
  const chartData = [
    { name: 'Citas', value: parseFloat(data.summary?.totalAppointmentRevenue || 0) },
    { name: 'Ventas', value: parseFloat(data.summary?.totalSalesRevenue || 0) }
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MoneyIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h5" sx={{ color: '#1F2937' }}>Resumen de Ingresos</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  ${parseFloat(data.summary?.totalRevenue || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total de Ingresos</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#EFF6FF', borderRadius: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  ${parseFloat(data.summary?.totalAppointmentRevenue || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Ingresos por Citas</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FEF3C7', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#F59E0B' }} fontWeight="bold">
                  ${parseFloat(data.summary?.totalSalesRevenue || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Ingresos por Ventas</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {data.appointments?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1F2937' }}>Detalle de Citas</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#3B82F6' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mascota</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Servicio</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Precio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.appointments.slice(0, 20).map((apt, idx) => (
                    <TableRow key={apt.id} sx={{ bgcolor: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                      <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                      <TableCell>{apt.Pet?.User?.name || 'N/A'}</TableCell>
                      <TableCell>{apt.Pet?.name || 'N/A'}</TableCell>
                      <TableCell>{apt.Service?.name || 'N/A'}</TableCell>
                      <TableCell align="right">${parseFloat(apt.Service?.price || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {data.appointments.length > 20 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Mostrando 20 de {data.appointments.length} citas. Descarga el PDF o CSV para ver el detalle completo.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {data.sales?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1F2937' }}>Detalle de Ventas</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#3B82F6' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Método de Pago</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.sales.slice(0, 20).map((sale, idx) => (
                    <TableRow key={sale.id} sx={{ bgcolor: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.User?.name || 'Cliente General'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sale.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'} 
                          size="small" 
                          color={sale.paymentMethod === 'cash' ? 'success' : 'primary'}
                        />
                      </TableCell>
                      <TableCell align="right">${parseFloat(sale.total || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {data.sales.length > 20 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Mostrando 20 de {data.sales.length} ventas. Descarga el PDF o CSV para ver el detalle completo.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// Componente para reportes de citas
function AppointmentsReportView({ data }) {
  const statusCount = data.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCount).map(([status, count]) => ({
    name: status === 'scheduled' ? 'Agendadas' : status === 'completed' ? 'Completadas' : 'Canceladas',
    value: count
  }));

  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ color: '#1F2937' }}>Estadísticas de Citas</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ height: 300, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#3B82F6' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mascota</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Servicio</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 20).map((apt, idx) => (
                  <TableRow key={apt.id} sx={{ bgcolor: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.Pet?.name || 'N/A'}</TableCell>
                    <TableCell>{apt.Service?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={apt.status === 'completed' ? 'Completada' : apt.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                        size="small"
                        color={apt.status === 'completed' ? 'success' : apt.status === 'scheduled' ? 'primary' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="right">${parseFloat(apt.Service?.price || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 20 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Mostrando 20 de {data.length} citas. Descarga el PDF o CSV para ver todas.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// Componente para reportes de inventario
function InventoryReportView({ data }) {
  const lowStockProducts = data.filter(p => p.stock < p.minStock);
  const outOfStockProducts = data.filter(p => p.stock === 0);

  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, color: '#1F2937' }}>Estado del Inventario</Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#EFF6FF', borderRadius: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">{data.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total de Productos</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FEF3C7', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#F59E0B' }} fontWeight="bold">{lowStockProducts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Stock Bajo</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FEE2E2', borderRadius: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">{outOfStockProducts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Sin Stock</Typography>
              </Box>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#3B82F6' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Stock</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Stock Mínimo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Precio</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 20).map((product, idx) => (
                  <TableRow key={product.id} sx={{ bgcolor: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="center">{product.stock}</TableCell>
                    <TableCell align="center">{product.minStock}</TableCell>
                    <TableCell align="right">${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.stock === 0 ? 'Sin Stock' : product.stock < product.minStock ? 'Stock Bajo' : 'Normal'}
                        size="small"
                        color={product.stock === 0 ? 'error' : product.stock < product.minStock ? 'warning' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 20 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Mostrando 20 de {data.length} productos. Descarga el PDF o CSV para ver todos.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// Componente para reportes de usuarios
function UsersReportView({ data }) {
  const roleCount = data.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(roleCount).map(([role, count]) => ({
    name: role,
    value: count
  }));

  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, color: '#1F2937' }}>Distribución de Usuarios</Typography>

          <Box sx={{ height: 300, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#3B82F6' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 20).map((user, idx) => (
                  <TableRow key={user.id} sx={{ bgcolor: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role}
                        size="small"
                        color={user.role === 'Admin' ? 'error' : user.role === 'Veterinario' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 20 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Mostrando 20 de {data.length} usuarios. Descarga el PDF o CSV para ver todos.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ReportsPage() {
  const { token } = useAuthStore();
  const [reportType, setReportType] = useState('income');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('json');
  const [reportData, setReportData] = useState(null);

  const mutation = useMutation({
    mutationFn: downloadReport,
    onSuccess: ({ data, format: responseFormat }) => {
      if (responseFormat === 'json') {
        setReportData(data);
        toast.success('Reporte generado exitosamente.');
      } else {
        const blob = new Blob([data], { type: responseFormat === 'pdf' ? 'application/pdf' : 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.${responseFormat}`;
        link.click();
        toast.success('Reporte descargado exitosamente.');
      }
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al generar el reporte.'),
  });

  const handleGenerate = () => {
    const selectedReport = REPORT_TYPES.find(r => r.value === reportType);
    if (selectedReport.requiresDates && (!startDate || !endDate)) {
      toast.error('Por favor, selecciona las fechas de inicio y fin.');
      return;
    }
    setReportData(null); // Limpiar datos anteriores
    mutation.mutate({ type: reportType, startDate, endDate, format, token });
  };

  const selectedReport = REPORT_TYPES.find(r => r.value === reportType);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ color: '#1F2937' }}>Generación de Reportes</Typography>
      </Box>

      <Card sx={{ padding: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData(null); }}>
                  {REPORT_TYPES.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {selectedReport?.requiresDates && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Inicio"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Fin"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Formato de Exportación</InputLabel>
                <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <MenuItem value="json">Vista Previa Interactiva</MenuItem>
                  <MenuItem value="pdf">Descargar PDF</MenuItem>
                  <MenuItem value="csv">Descargar CSV (Excel)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={handleGenerate}
                disabled={mutation.isPending}
                fullWidth
              >
                {mutation.isPending ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </Grid>

            {format === 'json' && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<AssessmentIcon />}>
                  Los reportes en formato JSON se mostrarán a continuación con gráficos y tablas interactivas.
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Renderizar datos según el tipo de reporte */}
      {reportData && format === 'json' && (
        <>
          {reportType === 'income' && <IncomeReportView data={reportData} />}
          {reportType === 'appointments' && <AppointmentsReportView data={reportData} />}
          {reportType === 'inventory' && <InventoryReportView data={reportData} />}
          {reportType === 'users' && <UsersReportView data={reportData} />}
        </>
      )}
    </Container>
  );
}
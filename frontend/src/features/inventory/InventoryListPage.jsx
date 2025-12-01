import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Pagination,
  Grid,
  Chip,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import StockUpdateModal from './StockUpdateModal';

// Funciones de API
const fetchProducts = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/products?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);
};

const updateProduct = (productId, productData, token) => {
  return apiClient.put(`/products/${productId}`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const deleteProduct = (productId, token) => {
  return apiClient.delete(`/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default function InventoryListPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Estados
  const [filters, setFilters] = useState({
    name: '',
    lowStock: false,
    expiringSoon: false,
    page: 1,
  });
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Form para editar
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      provider: '',
      expiryDate: '',
    },
  });

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters, token),
    enabled: !!token,
    keepPreviousData: true,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ productId, productData }) =>
      updateProduct(productId, productData, token),
    onSuccess: () => {
      toast.success('Producto actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(selectedProduct.id, token),
    onSuccess: () => {
      toast.success('Producto eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      page: 1,
    }));
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      provider: product.provider,
      expiryDate: product.expiryDate?.split('T')[0] || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product, event) => {
    event.stopPropagation();
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const openStockModal = (product, event) => {
    event.stopPropagation();
    setSelectedProduct(product);
    setStockModalOpen(true);
    setAnchorEl(null);
  };

  const onEditSubmit = (data) => {
    updateMutation.mutate({
      productId: selectedProduct.id,
      productData: data,
    });
  };

  const handleMenuClick = (event, product) => {
    event.stopPropagation();
    setSelectedProduct(product);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>
                Inventario de Productos
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gestiona el stock y productos disponibles
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            to="/inventory/products/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar por nombre"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  name="lowStock"
                  checked={filters.lowStock}
                  onChange={handleFilterChange}
                />
              }
              label="Stock bajo (< 10)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  name="expiringSoon"
                  checked={filters.expiringSoon}
                  onChange={handleFilterChange}
                />
              }
              label="Próximo a vencer"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }} align="right">
                Precio
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }} align="center">
                Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1F2937' }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description || '-'}</TableCell>
                  <TableCell align="right">${parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.quantity}
                      color={product.quantity < 10 ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {product.quantity < 10 && (
                      <Tooltip title="Stock bajo">
                        <Chip icon={<WarningIcon />} label="Bajo" color="black" size="small" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, product)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedProduct?.id === product.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={(e) => openStockModal(product, e)}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Actualizar Stock
                      </MenuItem>
                      <MenuItem onClick={() => openEditDialog(product)}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Editar
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => openDeleteDialog(product, e)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No hay productos</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Mostrando {products.length} de {data?.total || 0} productos
            </Typography>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(e, page) => setFilters({ ...filters, page })}
              color="primary"
              shape="rounded"
            />
          </Box>
        </Box>
      )}

      {/* Modal Stock */}
      <StockUpdateModal
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Dialog Editar */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descripción"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Precio"
                    type="number"
                    inputProps={{ step: '0.01' }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="provider"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Proveedor" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Vencimiento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit(onEditSubmit)}
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el producto "{selectedProduct?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => deleteMutation.mutate()}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
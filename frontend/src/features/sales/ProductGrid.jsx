import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Button,
  Chip,
  Typography,
  Badge,
  Tooltip,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as PackageIcon,
  Handshake as HandshakeIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const ProductCard = ({ item, onAddToCart }) => {
  const isProduct = item.type === 'product';
  const hasStock = !isProduct || item.quantity > 0;
  const isLowStock = isProduct && item.quantity > 0 && item.quantity < 5;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
          transform: 'translateY(-2px)',
        },
        opacity: hasStock ? 1 : 0.6,
        position: 'relative',
      }}
    >
      {/* Badge de Tipo */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <Chip
          icon={isProduct ? <PackageIcon /> : <HandshakeIcon />}
          label={isProduct ? 'Producto' : 'Servicio'}
          color={isProduct ? 'primary' : 'success'}
          variant="filled"
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      {/* Low Stock Badge */}
      {isLowStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
          }}
        >
          <Tooltip title="Stock bajo">
            <Badge
              badgeContent={`${item.quantity}`}
              color="error"
              overlap="rectangular"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 20,
                  minWidth: 20,
                  padding: '0 4px',
                },
              }}
            >
              <WarningIcon sx={{ color: '#DC2626', fontSize: 20 }} />
            </Badge>
          </Tooltip>
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ flex: 1, pb: 1, pt: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4em',
          }}
        >
          {item.name}
        </Typography>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 1,
            minHeight: '2.2em',
          }}
        >
          {item.description || 'Sin descripción disponible'}
        </Typography>

        {/* Stock Info */}
        {isProduct && (
          <Box sx={{ marginTop: 1, marginBottom: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Stock disponible:
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                marginTop: 0.5,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: 6,
                  backgroundColor: '#E5E7EB',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${Math.min((item.quantity / 100) * 100, 100)}%`,
                    backgroundColor: item.quantity < 5 ? '#DC2626' : item.quantity < 10 ? '#F59E0B' : '#10B981',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: item.quantity < 5 ? '#DC2626' : item.quantity < 10 ? '#F59E0B' : '#10B981',
                  minWidth: '30px',
                }}
              >
                {item.quantity}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Expiry Date Info */}
        {isProduct && item.expiryDate && (
          <Box sx={{ marginTop: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Vencimiento:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                marginTop: 0.25,
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              {new Date(item.expiryDate).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          paddingTop: 1,
          paddingBottom: 2,
          paddingX: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #E5E7EB',
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
          S/ {Number(item.price || 0).toFixed(2)}
        </Typography>

        <Tooltip
          title={
            !hasStock
              ? isProduct
                ? 'Sin stock disponible'
                : 'No disponible'
              : 'Agregar al carrito'
          }
        >
          <span>
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!hasStock}
              variant="contained"
              size="small"
              startIcon={<ShoppingCartIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: '#1E40AF',
                '&:hover:not(:disabled)': {
                  backgroundColor: '#1E3A8A',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: '#D1D5DB',
                  color: '#9CA3AF',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Añadir
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default function ProductGrid({ items, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Todos');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        category === 'Todos' ||
        (category === 'Productos' && item.type === 'product') ||
        (category === 'Servicios' && item.type === 'service');
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, category]);

  const stats = {
    total: items.length,
    products: items.filter((i) => i.type === 'product').length,
    services: items.filter((i) => i.type === 'service').length,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Filtros Sticky */}
      <Paper
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: 2,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E5E7EB',
          borderRadius: 1,
        }}
      >
        {/* Buscador */}
        <TextField
          fullWidth
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#1E40AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1E40AF',
              },
            },
          }}
        />

        {/* Filtro por Categoría */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>
            Filtrar por:
          </Typography>

          <ToggleButtonGroup
            value={category}
            exclusive
            onChange={(e, newCategory) => {
              if (newCategory !== null) {
                setCategory(newCategory);
              }
            }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&.Mui-selected': {
                  backgroundColor: '#1E40AF',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1E3A8A',
                  },
                },
                '&:not(.Mui-selected)': {
                  borderColor: '#D1D5DB',
                  color: '#6B7280',
                },
              },
            }}
          >
            <ToggleButton value="Todos" sx={{ px: 2 }}>
              📦 Todos ({stats.total})
            </ToggleButton>
            <ToggleButton value="Productos" sx={{ px: 2 }}>
              <PackageIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Productos ({stats.products})
            </ToggleButton>
            <ToggleButton value="Servicios" sx={{ px: 2 }}>
              <HandshakeIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Servicios ({stats.services})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Resultados */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            marginTop: 1.5,
            color: '#6B7280',
            fontWeight: 500,
          }}
        >
          {filteredItems.length} de {items.length} artículos
          {searchTerm && ` • Buscando: "${searchTerm}"`}
        </Typography>
      </Paper>

      {/* Grid de Productos */}
      {filteredItems.length > 0 ? (
        <Grid container spacing={2}>
          {filteredItems.map((item) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={`${item.type}-${item.id}`}
            >
              <ProductCard item={item} onAddToCart={onAddToCart} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: '#D1D5DB', marginBottom: 1 }} />
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
            No se encontraron resultados
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Intenta con otro término de búsqueda o categoría
          </Typography>
        </Paper>
      )}

      {/* Debug Info (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <Paper
          sx={{
            padding: 2,
            backgroundColor: '#FEF3C7',
            border: '1px solid #FBBF24',
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: '#92400E',
            }}
          >
            <strong>🔧 Debug:</strong> Total: {stats.total} • Productos: {stats.products} • Servicios:{' '}
            {stats.services} • Filtrados: {filteredItems.length} • Search: "{searchTerm}" • Category:{' '}
            {category}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
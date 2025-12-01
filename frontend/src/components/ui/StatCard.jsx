import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle = '',
  color = 'primary',
  trend = null, // { value: "+12%", direction: "up" | "down" }
  loading = false,
}) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(63, 81, 181, 0.12)',
          transform: 'translateY(-4px)',
          borderColor: colorValue,
        },
      }}
    >
      <CardContent sx={{ padding: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
          {/* Contenido principal */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mb: 1,
                  color: '#6B7280'
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#1F2937',
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {loading ? '...' : value}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{ 
                    display: 'block',
                    color: '#9CA3AF',
                    fontSize: '0.75rem',
                    mt: 0.5
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Indicador de tendencia */}
            {trend && !loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                {trend.direction === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 18, color: '#10B981' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: trend.direction === 'up' ? '#10B981' : '#EF4444',
                    fontSize: '0.813rem',
                  }}
                >
                  {trend.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', ml: 0.5 }}>
                  vs mes anterior
                </Typography>
              </Box>
            )}
          </Box>

          {/* Icono */}
          <Box
            sx={{
              backgroundColor: `${colorValue}15`,
              borderRadius: 2,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 64,
              minHeight: 64,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: `${colorValue}25`,
                transform: 'scale(1.05)',
              },
            }}
          >
            <Icon
              sx={{
                fontSize: 36,
                color: colorValue,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
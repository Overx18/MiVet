import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle = '',
  color = 'primary',
}) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#FFFFFF',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.12)',
          transform: 'translateY(-2px)',
          borderColor: colorValue,
        },
      }}
    >
      <CardContent sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              backgroundColor: `${colorValue}12`,
              borderRadius: 2,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
              minHeight: 60,
            }}
          >
            <Icon
              sx={{
                fontSize: 32,
                color: colorValue,
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="textSecondary"
              variant="body2"
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                marginTop: 0.5,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginTop: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
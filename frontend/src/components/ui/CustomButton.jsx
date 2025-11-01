import { Button } from '@mui/material';

export default function CustomButton({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      type={type}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        transition: 'all 0.3s ease',
      }}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </Button>
  );
}
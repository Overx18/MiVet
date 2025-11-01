import { Alert, AlertTitle } from '@mui/material';

export default function AlertMessage({
  severity = 'info',
  title = '',
  message,
  onClose,
  ...props
}) {
  return (
    <Alert
      severity={severity}
      onClose={onClose}
      sx={{
        borderRadius: 1,
        marginBottom: 2,
      }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
}
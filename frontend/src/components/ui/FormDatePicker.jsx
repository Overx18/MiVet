import { TextField } from '@mui/material';

export default function FormDatePicker({
  label,
  name,
  value,
  onChange,
  error = false,
  helperText = '',
  disabled = false,
  fullWidth = true,
  required = false,
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      type="date"
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      required={required}
      InputLabelProps={{
        shrink: true,
      }}
      variant="outlined"
      {...props}
    />
  );
}
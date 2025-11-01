import { TextField } from '@mui/material';

export default function FormInput({
  label,
  name,
  type = 'text',
  error = false,
  helperText = '',
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  required = false,
  multiline = false,
  rows = 1,
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      error={error}
      helperText={helperText}
      value={value}
      onChange={onChange}
      disabled={disabled}
      fullWidth={fullWidth}
      required={required}
      multiline={multiline}
      rows={rows}
      variant="outlined"
      {...props}
    />
  );
}
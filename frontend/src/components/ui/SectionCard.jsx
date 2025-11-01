import { Card, CardHeader, CardContent, Divider } from '@mui/material';

export default function SectionCard({
  title,
  subtitle = '',
  icon = null,
  children,
  action = null,
  ...props
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#FFFFFF',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.08)',
        },
      }}
      {...props}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        avatar={icon}
        action={action}
        titleTypographyProps={{
          variant: 'h5',
          sx: { fontWeight: 600, color: '#1F2937' },
        }}
        subheaderTypographyProps={{
          sx: { color: '#6B7280', fontSize: '0.875rem' },
        }}
        sx={{ paddingBottom: 2 }}
      />
      <Divider sx={{ borderColor: '#E5E7EB' }} />
      <CardContent sx={{ paddingTop: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
}

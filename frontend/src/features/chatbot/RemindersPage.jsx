// frontend/src/features/chatbot/RemindersPage.jsx
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Pets as PetsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const fetchReminders = (token) =>
  apiClient.get('/chatbot/reminders', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

export default function RemindersPage() {
  const { token } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['chatbotReminders'],
    queryFn: () => fetchReminders(token),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Error al cargar los recordatorios.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 40, color: '#3F51B5' }} />
        <Typography variant="h4" sx={{ color: '#1F2937', fontWeight: 700 }}>
          Recordatorios de VetBot
        </Typography>
      </Box>

      <Card sx={{ padding: 3 }}>
        <CardContent>
          {data?.reminders?.length === 0 ? (
            <Alert severity="info">¡Todo al día! No tienes recordatorios pendientes.</Alert>
          ) : (
            <List>
              {data?.reminders?.map((reminder, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: '#F8FAFC',
                    '&:hover': { backgroundColor: '#E8EAF6' },
                  }}
                >
                  <ListItemIcon>
                    <PetsIcon sx={{ color: '#3F51B5' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={reminder.petName}
                    secondary={reminder.message}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={reminder.type}
                    size="small"
                    color={reminder.priority === 'medium' ? 'warning' : 'default'}
                    icon={reminder.priority === 'medium' ? <WarningIcon /> : undefined}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
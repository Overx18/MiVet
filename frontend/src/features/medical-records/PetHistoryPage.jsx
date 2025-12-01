import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Card, TextField, Grid, CircularProgress, Alert, Chip, Paper
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { MedicalServices as MedicalServicesIcon, Healing as HealingIcon, Note as NoteIcon, Vaccines as VaccinesIcon } from '@mui/icons-material';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const fetchPetHistory = async (petId, filters, token) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await apiClient.get(`/medical-records/by-pet/${petId}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function PetHistoryPage() {
  const { petId } = useParams();
  const { token } = useAuthStore();
  const [keyword, setKeyword] = useState('');

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['petHistory', petId, keyword],
    queryFn: () => fetchPetHistory(petId, { keyword }, token),
    enabled: !!petId && !!token,
  });

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h1" sx={{ marginBottom: 4, color: '#1F2937', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
        Historial Médico
      </Typography>
      
      <Card sx={{ padding: 3, marginBottom: 4 }}>
        <TextField
          fullWidth
          label="Buscar por diagnóstico, tratamiento o notas..."
          variant="outlined"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </Card>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {isError && <Alert severity="error">No se pudo cargar el historial.</Alert>}
      
      {!isLoading && !isError && (
        <Timeline position="alternate">
          {history?.length === 0 && <Typography sx={{ textAlign: 'center' }}>No hay registros para mostrar.</Typography>}
          {history?.map((record, index) => (
            <TimelineItem key={record.id}>
              <TimelineOppositeContent color="text.secondary">
                {formatDate(record.appointment.dateTime)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary"><MedicalServicesIcon /></TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" component="span">{record.appointment.service.name}</Typography>
                  <Typography>Profesional: {record.appointment.professional.firstName}</Typography>
                  <Box mt={2}>
                    <Typography variant="body1"><strong>Diagnóstico:</strong> {record.diagnosis || 'N/A'}</Typography>
                    <Typography variant="body1"><strong>Tratamiento:</strong> {record.treatment || 'N/A'}</Typography>
                    {record.notes && <Typography variant="body2" sx={{ mt: 1 }}><strong>Notas:</strong> {record.notes}</Typography>}
                    {record.products.length > 0 && (
                      <Box mt={1}>
                        <strong>Productos usados:</strong>
                        {record.products.map(p => (
                          <Chip key={p.id} label={`${p.name} (x${p.MedicalRecordProduct.quantityUsed})`} size="small" sx={{ ml: 1 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Container>
  );
}
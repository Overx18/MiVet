// frontend/src/components/chatbot/ChatbotWidget.jsx
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Chip,
  Collapse,
  Fade,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const sendChatMessage = ({ message, userId }) =>
  apiClient.post('/chatbot/message', { message, userId });

export default function ChatbotWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy VetBot, tu asistente veterinario 24/7. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (response) => {
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.message,
        timestamp: new Date(),
        isEscalated: response.data.isEscalated,
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: () => {
      toast.error('Error al enviar mensaje. Inténtalo de nuevo.');
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    mutation.mutate({ message: inputValue, userId: user?.id });
    setInputValue('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón flotante para abrir/cerrar el chatbot */}
      <Fab
        color="primary"
        aria-label="chatbot"
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: '#3F51B5',
          '&:hover': { backgroundColor: '#303F9F' },
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Ventana del chatbot */}
      <Collapse in={isOpen} timeout={300}>
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 96,
              right: 24,
              width: { xs: 'calc(100% - 48px)', sm: 400 },
              maxWidth: 400,
              height: 600,
              maxHeight: 'calc(100vh - 120px)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Header del chatbot */}
            <Box
              sx={{
                backgroundColor: '#3F51B5',
                color: '#FFFFFF',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ backgroundColor: '#E8EAF6' }}>
                  <BotIcon sx={{ color: '#3F51B5' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  VetBot
                </Typography>
              </Box>
              <IconButton onClick={handleToggle} size="small" sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Área de mensajes */}
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                padding: 2,
                backgroundColor: '#F8FAFC',
              }}
            >
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    padding: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '85%',
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 'auto' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: msg.sender === 'user' ? '#3F51B5' : '#E8EAF6',
                        }}
                      >
                        {msg.sender === 'user' ? (
                          <PersonIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                        ) : (
                          <BotIcon sx={{ fontSize: 18, color: '#3F51B5' }} />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      elevation={1}
                      sx={{
                        padding: 1.5,
                        borderRadius: 2,
                        backgroundColor: msg.sender === 'user' ? '#3F51B5' : '#FFFFFF',
                        color: msg.sender === 'user' ? '#FFFFFF' : '#212121',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </Typography>
                      {msg.isEscalated && (
                        <Chip
                          label="Contacta a nuestro equipo"
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              {mutation.isPending && (
                <ListItem sx={{ justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>

            {/* Input para escribir mensajes */}
            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{
                padding: 2,
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                gap: 1,
                backgroundColor: '#FFFFFF',
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Escribe tu pregunta..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={mutation.isPending}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={!inputValue.trim() || mutation.isPending}
                sx={{
                  backgroundColor: '#3F51B5',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#303F9F' },
                  '&:disabled': { backgroundColor: '#E5E7EB' },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Fade>
      </Collapse>
    </>
  );
}
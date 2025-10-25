import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import db from './api/models/index.js';
import { startReminderJob } from './services/cron.service.js';
import apiRoutes from './api/routes/index.js';
import { handleStripeWebhook } from './api/controllers/payment.controller.js';

const app = express();
app.use(cors());
app.use(helmet());

// Webhook de Stripe debe ir antes del JSON parser
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);
// El resto de la API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('API de MiVet funcionando correctamente'));
app.use('/api', apiRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('Base de datos sincronizada.');
    app.listen(config.port, () => {
      console.log(` Servidor corriendo en http://localhost:${config.port}`);
      startReminderJob();
    });
  } catch (err) {
    console.error(' Error al iniciar el servidor:', err);
  }
};

startServer();

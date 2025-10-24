// backend/src/app.js
// Punto de entrada principal: configura y arranca el servidor Express

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import db from './api/models/index.js';
import { startReminderJob } from './services/cron.service.js'; // Importar el servicio

import apiRoutes from './api/routes/index.js';
// Y un manejador de errores centralizado
// import errorHandler from './api/utils/errorHandler.js';

const app = express();

// Middlewares esenciales
app.use(cors()); // Permite solicitudes de otros orígenes (frontend)
app.use(helmet()); // Añade cabeceras de seguridad
app.use(express.json()); // Permite parsear JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite parsear datos de formularios

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('API de MiVet está funcionando correctamente.');
});
// Rutas de la API
app.use('/api', apiRoutes)

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'La ruta solicitada no fue encontrada.' });
});

// Middleware para manejar errores globales
// app.use(errorHandler);

// Función principal para arrancar el servidor y la base de datos
const startServer = async () => {
  try {
    // Sincroniza los modelos con la base de datos.
    // { force: false } evita que se borren los datos en cada reinicio.
    // Usa { force: true } en desarrollo si necesitas recrear las tablas.
    await db.sequelize.sync({ force: false });
    console.log('Conexión a la base de datos establecida y sincronizada.');

    // Inicia el servidor Express
    app.listen(config.port, () => {
      console.log(`Servidor escuchando en http://localhost:${config.port}`);

      // Iniciar el cron job después de que el servidor esté listo
      startReminderJob();
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

startServer();
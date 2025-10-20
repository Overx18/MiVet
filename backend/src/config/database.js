//Configuración de la conexión a la base de datos (Sequelize)
// backend/src/config/database.js
import { Sequelize } from 'sequelize';
import { config } from './index.js';

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false, // Desactiva los logs de SQL en la consola, puedes activarlo si lo necesitas
  }
);

export default sequelize;
//Modelo para Servicios
// backend/src/api/models/service.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class Service extends Model {}

  Service.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duración en minutos
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Médico', 'Estético'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Service',
  });

  return Service;
};
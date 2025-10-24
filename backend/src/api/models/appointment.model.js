//Modelo para Citas
// backend/src/api/models/appointment.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class Appointment extends Model {}

  Appointment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pagada', 'Completada', 'Cancelada'),
      defaultValue: 'Pagada',
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Appointment',
  });

  return Appointment;
};
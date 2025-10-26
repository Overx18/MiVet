// backend/src/api/models/sale.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('Efectivo', 'Tarjeta'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Pagada', 'Cancelada'),
      defaultValue: 'Pendiente',
      allowNull: false,
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return Sale;
};
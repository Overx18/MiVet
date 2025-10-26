// backend/src/api/models/stockTransaction.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const StockTransaction = sequelize.define('StockTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('Entrada', 'Salida', 'Venta', 'Ajuste'),
      allowNull: false,
    },
    quantityChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Positivo para entradas, negativo para salidas',
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Foreign keys se añadirán en las asociaciones
  });
  return StockTransaction;
};
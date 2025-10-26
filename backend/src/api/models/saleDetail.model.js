// backend/src/api/models/saleDetail.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SaleDetail = sequelize.define('SaleDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Foreign keys para product y service (uno de los dos será null)
  });
  return SaleDetail;
};
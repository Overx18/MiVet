// backend/src/api/models/medicalRecordProduct.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MedicalRecordProduct = sequelize.define('MedicalRecordProduct', {
    quantityUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });
  return MedicalRecordProduct;
};
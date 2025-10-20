//Modelo para Historial Médico
// backend/src/api/models/medicalRecord.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class MedicalRecord extends Model {}

  MedicalRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
    },
    treatment: {
      type: DataTypes.TEXT,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'MedicalRecord',
  });

  return MedicalRecord;
};
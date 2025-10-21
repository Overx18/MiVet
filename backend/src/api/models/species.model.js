//Modelo para Especies
// backend/src/api/models/species.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class Species extends Model {}

  Species.init({
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
  }, {
    sequelize,
    modelName: 'Species',
    timestamps: false, // No necesita createdAt/updatedAt
  });

  return Species;
};
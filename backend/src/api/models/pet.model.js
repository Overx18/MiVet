//Modelo para Mascotas
// backend/src/api/models/pet.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class Pet extends Model {}

  Pet.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    race: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    weight: {
      type: DataTypes.FLOAT,
    },
    gender: {
      type: DataTypes.ENUM('Macho', 'Hembra'),
    },
    birthDate: {
      type: DataTypes.DATEONLY,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Para borrado lógico
    },
  }, {
    sequelize,
    modelName: 'Pet',
  });

  return Pet;
};
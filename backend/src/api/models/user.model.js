//Modelo para Usuarios y Roles
// backend/src/api/models/user.model.js
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class User extends Model {
    // Método para verificar la contraseña
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Cliente', 'Veterinario', 'Recepcionista', 'Groomer'),
      defaultValue: 'Cliente',
      allowNull: false,
    },
   // workingHours: {
    //  type: DataTypes.JSON, // Campo para almacenar el horario laboral
    //  allowNull: true, // Solo los profesionales lo tendrán
    //},
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Nuevos campos para recuperación de contraseña
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      // Hook para hashear la contraseña antes de crear o actualizar el usuario
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  return User;
};
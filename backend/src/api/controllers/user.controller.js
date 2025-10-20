//Lógica para CRUD de usuarios, roles
// backend/src/api/controllers/user.controller.js
import createError from 'http-errors';
import db from '../models/index.js';

const User = db.User;

// Obtener el perfil del usuario autenticado
export const getProfile = async (req, res, next) => {
  // El middleware 'protect' ya adjuntó el usuario a req.user
  res.status(200).json(req.user);
};

// Actualizar el perfil del usuario autenticado
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return next(createError(404, 'Usuario no encontrado.'));
    }

    const { firstName, lastName, phone, address, password } = req.body;

    // Actualizar campos
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    // Si se proporciona una nueva contraseña, el hook 'beforeSave' la encriptará
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};
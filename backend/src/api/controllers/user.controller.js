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

// [Admin] Obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};

      // 2. APLICAR LÓGICA DE FILTRADO BASADA EN ROL
  if (req.user.role === 'Recepcionista') {
    // Si es recepcionista, forzar a que solo pueda ver clientes.
    filter.role = 'Cliente';
  } else if (req.query.role) {
    // Si es Admin (o otro rol futuro) y especifica un rol, usarlo.
    filter.role = req.query.role;
  }

    const users = await User.findAll({
      where: filter,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive'],
      order: [['firstName', 'ASC']],
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// [Admin] Actualizar el rol de un usuario
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Validar que el rol sea uno de los permitidos
    const allowedRoles = ['Admin', 'Cliente', 'Veterinario', 'Recepcionista', 'Groomer'];
    if (!allowedRoles.includes(role)) {
      return next(createError(400, 'Rol no válido.'));
    }

    const user = await User.findByPk(id);
    if (!user) {
      return next(createError(404, 'Usuario no encontrado.'));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'Rol de usuario actualizado exitosamente.',
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
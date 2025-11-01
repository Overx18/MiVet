// backend/src/api/controllers/user.controller.js
import createError from 'http-errors';
import db from '../models/index.js';

const { User } = db;

//  Obtener el perfil del usuario autenticado
export const getProfile = async (req, res) => {
  res.status(200).json({
    message: 'Perfil obtenido correctamente.',
    user: req.user,
  });
};

//  Actualizar el perfil del usuario autenticado
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(createError(404, 'Usuario no encontrado.'));

    const { firstName, lastName, phone, address, password } = req.body;

    // Actualizar solo los campos enviados
    await user.update({
      firstName: firstName?.trim() || user.firstName,
      lastName: lastName?.trim() || user.lastName,
      phone: phone?.trim() || user.phone,
      address: address?.trim() || user.address,
      ...(password ? { password } : {}), // Se encripta automáticamente por el hook beforeSave
    });

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

// 👥 [Admin o Recepcionista] Obtener todos los usuarios con filtros
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};

    // Si es recepcionista, solo puede ver clientes
    if (req.user.role === 'Recepcionista' ) {
      filter.role = 'Cliente';
    } else if (role) {
      filter.role = role;
    }

    const users = await User.findAll({
      where: filter,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt'],
      order: [['firstName', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      message: 'Lista de usuarios obtenida correctamente.',
      total: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

//  [Admin] Actualizar el rol de un usuario
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['Admin', 'Cliente', 'Veterinario', 'Recepcionista', 'Groomer'];
    if (!allowedRoles.includes(role)) {
      return next(createError(400, 'Rol no válido.'));
    }

    const user = await User.findByPk(id);
    if (!user) return next(createError(404, 'Usuario no encontrado.'));

    // Evitar que un admin se degrade a sí mismo accidentalmente
    if (user.id === req.user.id && role !== 'Admin') {
      return next(createError(403, 'No puedes cambiar tu propio rol.'));
    }

    await user.update({ role });

    res.status(200).json({
      message: `Rol actualizado a "${role}" correctamente.`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  [Admin] Activar o desactivar un usuario
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return next(createError(404, 'Usuario no encontrado.'));

    // Evitar que un admin se desactive a sí mismo
    if (user.id === req.user.id) {
      return next(createError(403, 'No puedes desactivar tu propia cuenta.'));
    }

    await user.update({ isActive: !user.isActive });

    res.status(200).json({
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} correctamente.`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
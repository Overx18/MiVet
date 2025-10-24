//Verifica el token JWT y protege rutas
// backend/src/middlewares/auth.middleware.js
import createError from 'http-errors';
import { verifyToken } from '../utils/jwt.js';
import db from '../api/models/index.js';

const User = db.User;

export const protect = async (req, res, next) => {
  try {
    // 1️ Verificar si el header existe y tiene formato correcto
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'No autorizado. Token ausente o malformado.'));
    }

    // 2️ Extraer el token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(createError(401, 'Token no proporcionado.'));
    }

    // 3️ Verificar el token
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return next(createError(401, 'Token inválido.'));
    }

    // 4️ Buscar al usuario
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(createError(401, 'Usuario no encontrado.'));
    }

    // (Opcional) 5️ Verificar si está activo
    if (user.isActive === false) {
      return next(createError(403, 'Cuenta desactivada. Contacta al administrador.'));
    }

    // 6️ Adjuntar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    next(createError(401, 'Token inválido o expirado.'));
  }
};

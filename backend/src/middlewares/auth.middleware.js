//Verifica el token JWT y protege rutas
// backend/src/middlewares/auth.middleware.js
import createError from 'http-errors';
import { verifyToken } from '../utils/jwt.js';
import db from '../api/models/index.js';

const User = db.User;

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token
      const decoded = verifyToken(token);

      // 3. Obtener el usuario del token y adjuntarlo a la solicitud
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }, // No incluir la contraseña
      });

      if (!req.user) {
        return next(createError(401, 'Usuario no encontrado.'));
      }

      next();
    } catch (error) {
      return next(createError(401, 'Token no válido o expirado.'));
    }
  }

  if (!token) {
    return next(createError(401, 'No autorizado, no se encontró token.'));
  }
};
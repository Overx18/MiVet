// backend/src/middlewares/role.middleware.js
import createError from 'http-errors';

/**
 * Middleware para restringir el acceso basado en roles.
 * @param  {...string} allowedRoles - Roles permitidos para acceder a la ruta.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1️ Verificar que el usuario esté autenticado
    if (!req.user) {
      return next(createError(401, 'No autorizado. Inicia sesión para continuar.'));
    }

    // 2️ Verificar que el usuario tenga un rol asignado
    if (!req.user.role) {
      return next(createError(403, 'Tu cuenta no tiene un rol asignado.'));
    }

    // 3️ Validar si el rol está permitido
    if (!allowedRoles.includes(req.user.role)) {
      return next(createError(403, `Acceso denegado. Rol requerido: ${allowedRoles.join(', ')}.`));
    }

    // 4️ Todo OK, continuar
    next();
  };
};

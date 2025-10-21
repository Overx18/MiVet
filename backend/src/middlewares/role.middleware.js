//Verifica que el usuario tenga el rol requerido (Admin, etc.)
// backend/src/middlewares/role.middleware.js
import createError from 'http-errors';

/**
 * Middleware para restringir el acceso basado en roles.
 * @param  {...string} allowedRoles - Los roles permitidos para acceder a la ruta.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(createError(403, 'No tienes permiso para realizar esta acción.'));
    }
    next();
  };
};
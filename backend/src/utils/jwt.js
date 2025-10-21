//Funciones para generar y verificar tokens JWT
// backend/src/utils/jwt.js
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Genera un token JWT para un usuario.
 * @param {object} payload - Datos para incluir en el token (ej. id, role).
 * @returns {string} El token JWT generado.
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '8h', // El token expirará en 8 horas
  });
};

/**
 * Verifica un token JWT.
 * @param {string} token - El token a verificar.
 * @returns {object} El payload decodificado si el token es válido.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
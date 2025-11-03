//Rutas para /api/auth (login, register)
// backend/src/api/routes/auth.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

// Definición de validaciones para el registro
const registerValidation = [
  body('firstName').notEmpty().withMessage('El nombre es obligatorio.'),
  body('lastName').notEmpty().withMessage('El apellido es obligatorio.'),
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
];

// Definición de validaciones para el login
const loginValidation = [
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
];

// Ruta para el registro de usuarios
// POST /api/auth/register
router.post('/register', registerValidation, register);
// POST /api/auth/login
router.post('/login', loginValidation, login);
// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', [body('email').isEmail()], forgotPassword);
// Ruta para restablecer la contraseña con el token
router.patch('/reset-password/:token', [body('password').isLength({ min: 8 })], resetPassword);

export default router;
//Rutas para /api/auth (login, register)
// backend/src/api/routes/auth.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Definición de validaciones para el registro
const registerValidation = [
  body('firstName').notEmpty().withMessage('El nombre es obligatorio.'),
  body('lastName').notEmpty().withMessage('El apellido es obligatorio.'),
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
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

export default router;
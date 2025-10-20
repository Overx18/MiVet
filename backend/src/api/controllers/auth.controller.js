//Lógica para registro, login, logout
// backend/src/api/controllers/auth.controller.js
import { validationResult } from 'express-validator';
import createError from 'http-errors';
import db from '../models/index.js';
import { generateToken } from '../../utils/jwt.js';

const User = db.User;

//Registro
export const register = async (req, res, next) => {
  // 1. Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { firstName, lastName, email, password, phone, address } = req.body;

  try {
    // 2. Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(createError(409, 'El correo electrónico ya está en uso.'));
    }

    // 3. Crear el nuevo usuario (el hook del modelo se encarga de hashear la contraseña)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      // El rol por defecto 'Cliente' y 'isConfirmed: false' se aplican desde el modelo
    });

    // 4. Enviar respuesta exitosa
    // (Aquí iría la lógica para enviar el email de confirmación)
    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar tu cuenta.',
      userId: newUser.id,
    });
  } catch (error) {
    next(error);
  }
};

//Iniciar sesion
export const login = async (req, res, next) => {
  // 1. Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, { errors: errors.array() }));
  }

  const { email, password } = req.body;

  try {
    // 2. Buscar al usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(createError(401, 'Credenciales inválidas.'));
    }

    // 3. Verificar si la cuenta está confirmada
    // if (!user.isConfirmed) {
    //   return next(createError(403, 'Tu cuenta no ha sido confirmada. Por favor, revisa tu correo.'));
    // }

    // 4. Validar la contraseña
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return next(createError(401, 'Credenciales inválidas.'));
    }

    // 5. Generar el token JWT
    const tokenPayload = {
      id: user.id,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    // 6. Enviar respuesta con el token y datos del usuario (sin contraseña)
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
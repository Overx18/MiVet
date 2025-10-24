// backend/src/api/controllers/auth.controller.js
import { validationResult } from 'express-validator';
import createError from 'http-errors';
import crypto from 'crypto';
import db from '../models/index.js';
import { generateToken } from '../../utils/jwt.js';
import { sendEmail } from '../../utils/email.js';

const { User, Sequelize } = db;

// Registro de usuario
export const register = async (req, res, next) => {
  try {
    // 1 Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(422, { errors: errors.array() }));
    }

    const { firstName, lastName, email, password, phone, address } = req.body;

    // 2️ Verificar existencia del usuario
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(createError(409, 'El correo electrónico ya está en uso.'));
    }

    // 3️ Crear usuario (el modelo maneja hash + rol por defecto)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
    });

    // 4️ Respuesta exitosa. (Aquí iría la lógica para enviar el email de confirmación)
    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar tu cuenta.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  Iniciar sesión
export const login = async (req, res, next) => {
  try {
    // 1️ Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(422, { errors: errors.array() }));
    }

    const { email, password } = req.body;

    // 2️ Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) return next(createError(401, 'Credenciales inválidas.'));

    // 3️ Validar contraseña
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) return next(createError(401, 'Credenciales inválidas.'));

    // 4️ Generar JWT
    const token = generateToken({ id: user.id, role: user.role });

    // 5️ Responder con datos limpios
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

//  Solicitar recuperación de contraseña
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Nunca revelar si el usuario existe
      return res.status(200).json({
        message: 'Si existe una cuenta con este correo, se enviará un enlace para restablecer la contraseña.',
      });
    }

    // 1️ Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2️ Guardar hash del token
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    // 3️ Crear URL y mensaje
    const resetURL = `${req.protocol}://${req.get('host').replace('3000', '5173')}/reset-password/${resetToken}`;
    const message = `
      Hola ${user.firstName || ''},
      Recibiste este correo porque solicitaste restablecer tu contraseña.
      Haz clic aquí para continuar: ${resetURL}
      Este enlace expirará en 10 minutos.
      Si no solicitaste esto, ignora el mensaje.
    `;

    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de contraseña - MiVet',
      text: message,
    });

    res.status(200).json({
      message: 'Se ha enviado un enlace para restablecer tu contraseña.',
    });
  } catch (error) {
    console.error(error);
    next(createError(500, 'Error al enviar el correo. Intenta nuevamente.'));
  }
};

//  Restablecer contraseña
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1️ Hashear token para comparar
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2️ Buscar usuario válido
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return next(createError(400, 'El token es inválido o ha expirado.'));
    }

    // 3️ Actualizar contraseña
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    next(error);
  }
};

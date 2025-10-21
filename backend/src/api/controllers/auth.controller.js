//Lógica para registro, login, logout
// backend/src/api/controllers/auth.controller.js
import { validationResult } from 'express-validator';
import createError from 'http-errors';
import crypto from 'crypto'; 
import db from '../models/index.js';
import { generateToken } from '../../utils/jwt.js';
import { sendEmail } from '../../utils/email.js';

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

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      // Para no revelar si un email existe, siempre enviamos una respuesta positiva.
      return res.status(200).json({ message: 'Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.' });
    }

    // 1. Generar un token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hashear el token y guardarlo en la base de datos
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expira en 10 minutos

    await user.save();

    // 3. Crear la URL de reseteo y enviar el correo
    const resetURL = `${req.protocol}://${req.get('host').replace('3000', '5173')}/reset-password/${resetToken}`;
    const message = `Recibiste este correo porque solicitaste un restablecimiento de contraseña. Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso:\n\n${resetURL}\n\nSi no solicitaste esto, por favor ignora este correo.`;

    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de Contraseña - MiVet',
      text: message,
    });

    res.status(200).json({ message: 'Se ha enviado un enlace para restablecer la contraseña a tu correo.' });
  } catch (error) {
    // Limpiar token en caso de error para evitar bloqueos
    if (req.user) {
      req.user.passwordResetToken = null;
      req.user.passwordResetExpires = null;
      await req.user.save();
    }
    next(createError(500, 'Hubo un error al enviar el correo. Inténtalo de nuevo más tarde.'));
  }
};

// Restablecer la contraseña
export const resetPassword = async (req, res, next) => {
  try {
    // 1. Obtener el token hasheado para buscarlo en la BD
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Buscar usuario por token y verificar que no haya expirado
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [db.Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return next(createError(400, 'El token es inválido o ha expirado.'));
    }

    // 3. Establecer la nueva contraseña
    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    // El hook 'beforeSave' se encargará de hashear la nueva contraseña
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    next(error);
  }
};
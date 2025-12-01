// backend/src/api/controllers/contact.controller.js
import { sendEmail } from '../../utils/email.js';
import createError from 'http-errors';

export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(createError(400, 'Todos los campos son obligatorios.'));
    }

    // Enviar email al administrador
    await sendEmail({
      to: 'admin@mivet.com',
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
    });

    res.status(200).json({ message: 'Mensaje enviado exitosamente.' });
  } catch (error) {
    next(error);
  }
};
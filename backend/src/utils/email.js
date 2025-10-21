// backend/src/utils/email.js
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Envía un correo electrónico.
 * @param {object} options - Opciones del correo (to, subject, text, html).
 */
export const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: '"MiVet - Soporte" <no-reply@mivet.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Correo enviado: %s', info.messageId);
    // URL de vista previa de Ethereal
    console.log('URL de vista previa: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};
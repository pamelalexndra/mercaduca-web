import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  generateEmailHTML,
  generateEmailText,
  generateAcceptanceEmailHTML,
  generateAcceptanceEmailText,
  generateRejectionEmailHTML,
  generateRejectionEmailText,
  generateModificationEmailHTML,
  generateModificationEmailText,
  generateLoginEmailHTML,
  generateLoginEmailText,
} from "./generateEmailContent.js";
import { getAllAdminRecipients } from "./emailToAdmins.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export const sendNotificationEmail = async (solicitud) => {
  try {
    const destinatarios = await getAllAdminRecipients();

    if (destinatarios.length === 0) {
      throw new Error("No hay destinatarios configurados para notificar");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: destinatarios.join(", "),
      subject: `Nueva Solicitud de Registro - MercadUCA`,
      html: generateEmailHTML(solicitud),
      text: generateEmailText(solicitud),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      destinatarios: destinatarios,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendAcceptanceEmail = async (solicitud) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: solicitud.correo,
      subject: `¡Felicidades! Tu solicitud en MercadUCA ha sido aceptada`,
      html: generateAcceptanceEmailHTML(solicitud),
      text: generateAcceptanceEmailText(solicitud),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      destinatario: solicitud.correo,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendRejectionEmail = async (solicitud, razon = "") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: solicitud.correo,
      subject: `Resultado de tu solicitud en MercadUCA`,
      html: generateRejectionEmailHTML(solicitud, razon),
      text: generateRejectionEmailText(solicitud, razon),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      destinatario: solicitud.correo,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendProfileModificationEmail = async (
  correoDestino,
  datosUsuario,
  cambios,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: correoDestino,
      subject: `Tus datos han sido modificados - MercadUCA`,
      html: generateModificationEmailHTML(datosUsuario, cambios),
      text: generateModificationEmailText(datosUsuario, cambios),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      destinatario: correoDestino,
    };
  } catch (error) {
    console.error("Error enviando correo de modificación:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendLoginNotificationEmail = async (correoDestino, loginData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: correoDestino,
      subject: `Nuevo inicio de sesion en tu cuenta de MercadUCA`,
      html: generateLoginEmailHTML(loginData),
      text: generateLoginEmailText(loginData),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error enviando correo de notificacion de login:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

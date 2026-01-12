import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  generateEmailHTML,
  generateEmailText,
  generateAcceptanceEmailHTML,
  generateAcceptanceEmailText,
  generateRejectionEmailHTML,
  generateRejectionEmailText,
} from "./generateEmailContent.js";

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

const destinatarios = [process.env.EMAIL_TO_OUTLOOK].filter((email) => email);

export const sendNotificationEmail = async (solicitud) => {
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

    console.log(`Correo de aceptación enviado a: ${solicitud.correo}`);

    return {
      success: true,
      messageId: info.messageId,
      destinatario: solicitud.correo,
    };
  } catch (error) {
    console.error("Error enviando correo de aceptación:", error);
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

    console.log(`Correo de rechazo enviado a: ${solicitud.correo}`);

    return {
      success: true,
      messageId: info.messageId,
      destinatario: solicitud.correo,
    };
  } catch (error) {
    console.error("Error enviando correo de rechazo:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
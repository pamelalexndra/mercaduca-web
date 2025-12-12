import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  generateEmailHTML,
  generateEmailText,
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

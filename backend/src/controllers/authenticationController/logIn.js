// src/controllers/authenticationController/logIn.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { findByUsername } from "../../services/findByUsername.js";
import { verifyPassword } from "../../utils/security/verifyPassword.js";

dotenv.config();

export const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Credenciales requeridas" });
    }

    const user = await findByUsername(username);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    if (user.activo === false) {
      return res.status(403).json({
        success: false,
        message: "Esta cuenta ha sido desactivada. Contacte a soporte.",
      });
    }

    const isValidPassword = await verifyPassword(password, user.contraseña);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id_usuario, username: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_usuario,
        username: user.usuario,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de seión",
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

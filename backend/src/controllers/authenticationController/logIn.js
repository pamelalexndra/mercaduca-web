// src/controllers/authenticationController/logIn.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findByUsername } from "../../utils/helpers/findByUsername.js";
import { verifyPassword } from "../../utils/security/verifyPassword.js";
import rateLimit from "express-rate-limit";
dotenv.config();

export const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Credenciales requeridas" });
    }

    // 1. Buscar usuario
    const user = await findByUsername(username);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    // Verificamos si el emprendedor fue desactivado (borrado lógico)
    if (user.activo === false) {
      return res.status(403).json({
        success: false,
        message: "Esta cuenta ha sido desactivada. Contacte a soporte.",
      });
    }

    // 2. Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.contraseña);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    // 3. Generar Token
    const token = jwt.sign(
      { id: user.id_usuario, username: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Responder
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_usuario,
        username: user.usuario,
        password: password,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

export const loginLimiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de seión"
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
})
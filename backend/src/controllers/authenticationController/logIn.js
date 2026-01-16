import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { findByUsername } from "../../services/findByUsername.js";
import { verifyPassword } from "../../utils/security/verifyPassword.js";
import bcrypt from 'bcryptjs';

dotenv.config();

export const logIn = async (req, res) => {
  try {

    const testHash = await bcrypt.hash("123456", 10);
    console.log("NUEVO HASH GENERADO POR TU SERVER:", testHash);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Credenciales requeridas" });
    }

    const user = await findByUsername(username);

    console.log("--- DEBUG LOGIN ---");
    console.log("Input Username:", username);
    console.log("Usuario encontrado en DB:", user ? "SÍ" : "NO");

    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    if (user.activo === false) {
      return res.status(403).json({
        success: false,
        message: "Esta cuenta ha sido desactivada. Contacte a soporte.",
      });
    }

    const hashEnDB = user.password;

    if (!hashEnDB) {
      console.error("Error: El objeto usuario no contiene la columna password");
      return res.status(500).json({ success: false, message: "Error interno de configuración de base de datos" });
    }

    const isValidPassword = await verifyPassword(password, hashEnDB);
    console.log("¿Contraseña válida?:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        username: user.usuario || user.Usuario, // Manejo de mayúsculas/minúsculas
        role: user.rol || user.Rol,
      },
      process.env.JWT_SECRET.trim(),
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_usuario,
        username: user.usuario || user.Usuario,
        role: user.rol || user.Rol,
      },
    });

  } catch (error) {
    console.error("DETALLE DEL ERROR EN LOGIN:", error);
    res.status(500).json({ success: false, message: "Error del servidor al procesar el login" });
  }
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión",
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
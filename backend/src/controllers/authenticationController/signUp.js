// src/controllers/authenticationController/signUp.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { createProfile } from "../../services/createProfile.js";
import { validateSignUp } from "../../validators/authValidator.js";
import { sanitizeInput } from "../../utils/helpers/sanitizer.js";

dotenv.config();

export const signUp = async (req, res) => {
  try {
    const sanitizedData = {
      username: sanitizeInput(req.body.username),
      password: req.body.password,
      nombres: sanitizeInput(req.body.nombres),
      apellidos: sanitizeInput(req.body.apellidos),
      correo: sanitizeInput(req.body.correo?.toLowerCase()),
      telefono: sanitizeInput(req.body.telefono),
    };

    const { error, value } = validateSignUp(sanitizedData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const user = await createProfile(sanitizedData);

    const token = jwt.sign(
      { id: user.id_usuario, username: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: { id: user.id_usuario, username: user.usuario },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ success: false, message: "El usuario ya existe" });
    }
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

export const signUpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 2,
  message: {
    success: false,
    message: "Demasiados intentos de registro, intenta en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
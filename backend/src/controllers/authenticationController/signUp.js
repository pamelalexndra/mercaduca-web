// src/controllers/authenticationController/signUp.js
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
      descripcion_solicitud: sanitizeInput(
        req.body.descripcion_solicitud || ""
      ),
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

    const solicitud = await createProfile(sanitizedData);

    res.status(201).json({
      success: true,
      message: "Solicitud de registro enviada exitosamente.",
      solicitud_id: solicitud.id_solicitud,
      data: {
        usuario: solicitud.usuario,
        nombres: solicitud.nombres,
        apellidos: solicitud.apellidos,
        correo: solicitud.correo,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      const constraint = error.constraint;
      if (constraint.includes("correo")) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está registrado",
        });
      }
      if (constraint.includes("usuario")) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya está en uso",
        });
      }
      if (constraint.includes("telefono")) {
        return res.status(400).json({
          success: false,
          message: "El número de teléfono ya está registrado",
        });
      }
    }
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

export const signUpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Demasiados intentos de registro, intenta en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
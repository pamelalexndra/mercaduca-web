// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findById } from "../services/findById.js";
dotenv.config();

// 1. Middleware para verificar que existe un token válido (Autenticación)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Verificar que el header exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. No se proporcionó un token válido"
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const message = err.name === "TokenExpiredError" ? "El token ha expirado" : "Token inválido";
      return res.status(403).json({ success: false, message }); // hacer una salida controlada porque el token no es válido
    }
    // continuar al flujo con normalidad
    req.user = decoded;
    next();
  });
};

// 2. Middleware para verificar sí es Administrador (Autorización)
export const verifyAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(500).json({
      success: false,
      message: "Error de servidor: No se verificó el usuario previamente"
    });
  }

  // Consultamos la BD para asegurar que sigue siendo admin en tiempo real
  try {
    const userDb = await findById(req.user.id);

    if (!userDb) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontardo en el sistema. Sesión inválida."
      });
    }

    if (userDb.rol === "Administrador") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado: Se requieren permisos de administrador"
      });
    }
  } catch (error) {
    console.error("Error en verifyAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error técnico al verificar permisos"
    });
  }
};
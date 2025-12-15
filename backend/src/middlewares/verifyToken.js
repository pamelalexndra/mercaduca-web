// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findById } from "../services/findById.js";
dotenv.config();

// 1. Middleware para verificar que existe un token válido (Autenticación)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Bearer Token -> Json Web Token
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" }); // Hacer una salida controlada por error de autorización

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" }); // hacer una salida controlada porque el token no es válido

    // continuar al flujo con normalidad
    req.user = user;
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

    if (userDb && userDb.rol === "Administrador") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Acceso revocado o privilegios insuficientes"
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error verificando permisos" });
  }
};

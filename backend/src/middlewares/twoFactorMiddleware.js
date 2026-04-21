import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET.trim());

    // Asegurar que req.user tenga el id en el formato correcto
    req.user = {
      id: decoded.id || decoded.userId || decoded.id_usuario,
      username: decoded.username,
      role: decoded.role,
      correo: decoded.correo,
      twoFactorEnabled: decoded.twoFactorEnabled,
      twoFactorVerified: decoded.twoFactorVerified,
      ...decoded,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

// Middleware opcional para verificar si el usuario ya pasó 2FA en esta sesión
export const twoFactorVerifiedMiddleware = (req, res, next) => {
  // Si el usuario no tiene 2FA activado, pasa directamente
  if (!req.user.twoFactorEnabled) {
    return next();
  }

  // Si tiene 2FA pero no está verificado en el token, rechazar
  if (!req.user.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      message: "Se requiere verificación de dos factores",
      requiresTwoFactor: true,
    });
  }

  next();
};
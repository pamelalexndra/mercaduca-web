import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { findByUsername } from "../../services/findByUsername.js";
import { verifyPassword } from "../../utils/security/verifyPassword.js";
import { verifyTwoFactorCode } from "../../services/twoFactor.service.js";
import {
  getLocationFromIp,
  getDeviceInfo,
} from "../../services/geolocationService.js";
import { sendLoginNotificationEmail } from "../../services/sendNotificationEmail.js";
import pool from "../../database/connection.js";

dotenv.config();

export const logIn = async (req, res) => {
  try {
    const { username, password, twoFactorCode, rememberDevice } = req.body;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = getDeviceInfo(userAgent);
    const location = await getLocationFromIp(ip);

    const loginInfo = {
      ip,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      location: `${location.city}, ${location.country}`,
      timestamp: new Date(),
      isMobile: deviceInfo.isMobile,
    };

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Credenciales requeridas",
      });
    }

    const user = await findByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    if (user.activo === false) {
      return res.status(403).json({
        success: false,
        message: "Esta cuenta ha sido desactivada. Contacte a soporte.",
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    if (user.two_factor_enabled === true) {
      if (!twoFactorCode) {
        return res.status(403).json({
          success: false,
          message: "Se requiere código de verificación",
          requiresTwoFactor: true,
          userId: user.id_usuario,
        });
      }

      const isValid2FA = await verifyTwoFactorCode(
        user.id_usuario,
        twoFactorCode,
      );

      if (!isValid2FA.success) {
        return res.status(401).json({
          success: false,
          message: "Código de verificación incorrecto",
        });
      }
    }

    const trustedDevices = user.trusted_devices || [];
    const deviceFingerprint = `${ip}|${userAgent.split(" ").slice(0, 3).join(" ")}`;

    const isNewDevice = !trustedDevices.some(
      (d) => d.fingerprint === deviceFingerprint,
    );
    const isNewLocation =
      trustedDevices.some((d) => d.location === loginInfo.location) === false;

    if (isNewDevice || isNewLocation) {
      await sendLoginNotificationEmail(user.correo, {
        nombre: user.nombres || user.usuario,
        email: user.correo,
        ...loginInfo,
        isNewDevice,
        isNewLocation,
      });
    }

    await pool.query(
      `UPDATE Usuarios 
       SET last_login_ip = $1, 
           last_login_user_agent = $2, 
           last_login_location = $3,
           last_login_at = CURRENT_TIMESTAMP
       WHERE id_usuario = $4`,
      [
        ip,
        userAgent,
        `${loginInfo.location} (${loginInfo.device} - ${loginInfo.browser})`,
        user.id_usuario,
      ],
    );

    if (rememberDevice && isNewDevice) {
      const updatedDevices = [
        ...trustedDevices,
        {
          fingerprint: deviceFingerprint,
          device: loginInfo.device,
          browser: loginInfo.browser,
          os: loginInfo.os,
          location: loginInfo.location,
          ip: ip,
          lastUsed: new Date(),
          trustedAt: new Date(),
        },
      ];

      const devicesToKeep = updatedDevices.slice(-10);

      await pool.query(
        `UPDATE Usuarios SET trusted_devices = $1 WHERE id_usuario = $2`,
        [JSON.stringify(devicesToKeep), user.id_usuario],
      );
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        username: user.usuario || user.Usuario,
        role: user.rol || user.Rol,
        correo: user.correo,
        twoFactorEnabled: user.two_factor_enabled === true,
        twoFactorVerified: user.two_factor_enabled === true,
        deviceFingerprint: deviceFingerprint,
      },
      process.env.JWT_SECRET.trim(),
      { expiresIn: rememberDevice ? "30d" : "24h" },
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_usuario,
        username: user.usuario || user.Usuario,
        role: user.rol || user.Rol,
        correo: user.correo,
        twoFactorEnabled: user.two_factor_enabled === true,
      },
      loginInfo: {
        ...loginInfo,
        isNewDevice,
        isNewLocation,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al procesar el login",
    });
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
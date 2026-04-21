import speakeasy from "speakeasy";
import pool from "../../database/connection.js";

export const validateTwoFactorCode = async (req, res) => {
  try {
    const { userId, twoFactorCode } = req.body;

    if (!userId || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
      });
    }

    // Obtener el secreto temporal (no importa si two_factor_enabled está activado)
    const result = await pool.query(
      "SELECT two_factor_secret FROM Usuarios WHERE id_usuario = $1",
      [userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!user.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message:
          "No hay una configuración de 2FA pendiente. Primero genera el código QR.",
      });
    }

    // Verificar el código TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: twoFactorCode,
      window: 1,
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Código inválido. Verifica que ingresaste el código correcto.",
      });
    }

    res.json({
      success: true,
      message: "Código verificado correctamente",
    });
  } catch (error) {
    console.error("Error validando código 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message,
    });
  }
};
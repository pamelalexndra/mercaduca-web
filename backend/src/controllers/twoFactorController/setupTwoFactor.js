import { generateTwoFactorSecret } from "../../services/twoFactor.service.js";
import pool from "../../database/connection.js";

export const setupTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Usuario no identificado",
      });
    }

    // Siempre obtener el correo desde la base de datos para estar seguros
    const result = await pool.query(
      `SELECT e.correo 
       FROM Usuarios u 
       LEFT JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor 
       WHERE u.id_usuario = $1`,
      [userId],
    );

    const userEmail = result.rows[0]?.correo;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message:
          "No se pudo obtener el correo del usuario. Verifica que tu perfil tenga un correo registrado.",
      });
    }

    const { secret, qrCode } = await generateTwoFactorSecret(userId, userEmail);

    res.json({
      success: true,
      secret,
      qrCode,
    });
  } catch (error) {
    console.error("Error en setup 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error al configurar 2FA: " + error.message,
    });
  }
};
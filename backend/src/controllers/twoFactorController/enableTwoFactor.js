import { verifyAndEnableTwoFactor } from "../../services/twoFactor.service.js";

export const enableTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Código de verificación requerido",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Usuario no identificado",
      });
    }

    const result = await verifyAndEnableTwoFactor(userId, token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    // NO se envía correo aquí, solo se activa 2FA en BD

    res.json({
      success: true,
      message: "2FA activado correctamente",
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error("Error activando 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message,
    });
  }
};
import { verifyTwoFactorCode } from "../../services/twoFactor.service.js";

export const verifyLoginTwoFactor = async (req, res) => {
  try {
    const { userId, twoFactorCode } = req.body;

    if (!userId || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
      });
    }

    // Primero verificar si el código es válido (sin importar si está activado)
    const result = await verifyTwoFactorCode(userId, twoFactorCode);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error || "Código 2FA inválido",
      });
    }

    res.json({
      success: true,
      message: "Código verificado correctamente",
    });
  } catch (error) {
    console.error("Error verificando 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message,
    });
  }
};
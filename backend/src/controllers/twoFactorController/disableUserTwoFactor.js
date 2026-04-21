import { disableTwoFactor } from "../../services/twoFactor.service.js";

export const disableUserTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Usuario no identificado",
      });
    }

    await disableTwoFactor(userId);

    // NO se envía correo aquí, solo se desactiva 2FA en BD

    res.json({
      success: true,
      message: "2FA deshabilitado correctamente",
    });
  } catch (error) {
    console.error("Error deshabilitando 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message,
    });
  }
};
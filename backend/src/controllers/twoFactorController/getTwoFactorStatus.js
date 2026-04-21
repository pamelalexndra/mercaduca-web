import { getTwoFactorStatus } from "../../services/twoFactor.service.js";

export const getTwoFactorStatusController = async (req, res) => {
  try {
    // Permitir obtener estado de otro usuario si se pasa como parámetro
    const targetUserId = req.query.userId || req.user.id;

    // Verificar permisos: solo administradores pueden ver el estado de otros
    if (targetUserId !== req.user.id && req.user.role !== "Administrador") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver el estado 2FA de este usuario",
      });
    }

    const status = await getTwoFactorStatus(targetUserId);

    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Error obteniendo estado 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message,
    });
  }
};
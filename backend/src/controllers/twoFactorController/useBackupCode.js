import { verifyBackupCode } from "../../services/twoFactor.service.js";

export const useBackupCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { backupCode } = req.body;

    if (!backupCode) {
      return res.status(400).json({
        success: false,
        message: "Código de respaldo requerido",
      });
    }

    const result = await verifyBackupCode(userId, backupCode);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: "Código de respaldo inválido",
      });
    }

    res.json({
      success: true,
      message: "Código de respaldo válido",
    });
  } catch (error) {
    console.error("Error verificando backup:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};
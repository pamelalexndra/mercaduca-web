import pool from "../database/connection.js";
import { sendProfileModificationEmail } from "./sendNotificationEmail.js";

// Función para notificar modificación de perfil (llamada desde updateProfile)
export const notifyProfileModification = async (
  userId,
  nuevosDatos,
  cambios,
  correoOriginal,
) => {
  try {
    // Determinar qué correo usar (el nuevo si cambió, o el original)
    const correoDestino = nuevosDatos.correo || correoOriginal;

    // Obtener información completa del usuario para el correo
    const result = await pool.query(
      `SELECT 
        u.id_usuario,
        u.usuario,
        e.nombres,
        e.apellidos,
        e.correo,
        e.telefono
       FROM Usuarios u
       LEFT JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
       WHERE u.id_usuario = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      console.error(`Usuario ${userId} no encontrado para notificación`);
      return;
    }

    const usuarioInfo = result.rows[0];

    // Combinar datos actuales con los nuevos (para mostrar cambios)
    const datosParaCorreo = {
      id_usuario: usuarioInfo.id_usuario,
      nombres: usuarioInfo.nombres,
      apellidos: usuarioInfo.apellidos,
      correo: usuarioInfo.correo,
      telefono: usuarioInfo.telefono,
      usuario: usuarioInfo.usuario,
      contraseña: nuevosDatos.contraseña || null,
    };

    // Enviar el correo
    await sendProfileModificationEmail(correoDestino, datosParaCorreo, cambios);
  } catch (error) {
    console.error("Error en notifyProfileModification:", error);
  }
};

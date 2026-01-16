// src/controllers/adminController/denyRequest.js
import pool from "../../database/connection.js";
import { sendRejectionEmail } from "../../services/sendNotificationEmail.js";

export const denyRequest = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const id_solicitud = id;
    const { razon } = req.body; // Obtener razón del cuerpo de la petición

    await client.query("BEGIN");

    // Obtener datos completos de la solicitud para el correo
    const solicitudResult = await client.query(
      `SELECT * FROM Solicitudes WHERE id_solicitud = $1`,
      [id_solicitud]
    );

    if (solicitudResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    const solicitud = solicitudResult.rows[0];

    // Eliminar la solicitud
    await client.query(`DELETE FROM Solicitudes WHERE id_solicitud = $1`, [
      id_solicitud,
    ]);

    await client.query("COMMIT");

    // Enviar correo de rechazo (no bloqueante)
    try {
      await sendRejectionEmail(solicitud, razon || "");
    } catch (emailError) {
      console.error("Error enviando correo de rechazo:", emailError);
      // No fallar la operación principal si el correo falla
    }

    res.json({
      success: true,
      message: "Solicitud rechazada y eliminada exitosamente",
      data: {
        id_solicitud: id_solicitud,
        usuario: solicitud.usuario,
        correo: solicitud.correo,
        nombres: solicitud.nombres,
        apellidos: solicitud.apellidos,
        razon: razon || "No especificada",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error rechazando solicitud:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar el rechazo",
    });
  } finally {
    client.release();
  }
};

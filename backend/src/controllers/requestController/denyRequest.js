// src/controllers/adminController/denyRequest.js
import pool from "../../database/connection.js";

export const denyRequest = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id_solicitud } = req.params;

    await client.query("BEGIN");

    const solicitudResult = await client.query(
      `SELECT usuario, correo FROM Solicitudes WHERE id_solicitud = $1`,
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

    await client.query(`DELETE FROM Solicitudes WHERE id_solicitud = $1`, [
      id_solicitud,
    ]);

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Solicitud rechazada y eliminada exitosamente",
      data: {
        id_solicitud: id_solicitud,
        usuario: solicitud.usuario,
        correo: solicitud.correo,
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

// src/controllers/adminController/acceptRequest.js
import pool from "../../database/connection.js";
import { sendAcceptanceEmail } from "../../services/sendNotificationEmail.js";

export const acceptRequest = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const id_solicitud = id;

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

    // Insertar en Emprendedor
    const emprendedorResult = await client.query(
      `
      INSERT INTO Emprendedor (nombres, apellidos, correo, telefono, activo)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id_emprendedor
      `,
      [
        solicitud.nombres,
        solicitud.apellidos,
        solicitud.correo,
        solicitud.telefono,
      ]
    );

    const idEmprendedor = emprendedorResult.rows[0].id_emprendedor;

    // Insertar en Usuarios
    const usuarioResult = await client.query(
      `
      INSERT INTO Usuarios (usuario, contraseña, id_emprendedor, rol)
      VALUES ($1, $2, $3, 'Vendedor')
      RETURNING id_usuario, usuario
      `,
      [solicitud.usuario, solicitud.contraseña, idEmprendedor]
    );

    // Eliminar la solicitud
    await client.query(`DELETE FROM Solicitudes WHERE id_solicitud = $1`, [
      id_solicitud,
    ]);

    await client.query("COMMIT");

    // Enviar correo de aceptación (no bloqueante)
    try {
      await sendAcceptanceEmail(solicitud);
    } catch (emailError) {
      console.error("Error enviando correo de aceptación:", emailError);
      // No fallar la operación principal si el correo falla
    }

    res.json({
      success: true,
      message: "Solicitud aceptada y registrada exitosamente",
      data: {
        emprendedor_id: idEmprendedor,
        usuario_id: usuarioResult.rows[0].id_usuario,
        usuario: usuarioResult.rows[0].usuario,
        nombres: solicitud.nombres,
        apellidos: solicitud.apellidos,
        correo: solicitud.correo,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      let campo = "datos";
      if (error.constraint.includes("correo")) campo = "correo electrónico";
      if (error.constraint.includes("usuario")) campo = "nombre de usuario";
      if (error.constraint.includes("telefono")) campo = "teléfono";

      return res.status(400).json({
        success: false,
        message: `El ${campo} ya existe en el sistema. No se puede procesar la solicitud.`,
      });
    }

    console.error("Error aceptando solicitud:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  } finally {
    client.release();
  }
};

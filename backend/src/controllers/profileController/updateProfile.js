import pool from "../../database/connection.js";
import { generateHash } from "../../utils/security/generateHash.js";
import { notifyProfileModification } from "../../services/notifyProfileModification.js";

export const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombres, apellidos, correo, telefono, username, nuevaContraseña } =
      req.body;
    const { userId } = req.params;

    await client.query("BEGIN");

    // Obtener datos actuales para comparar después
    const currentDataResult = await client.query(
      `SELECT u.id_usuario, u.usuario, u.contraseña, u.registro_contraseña,
              e.nombres, e.apellidos, e.correo, e.telefono
       FROM Usuarios u
       LEFT JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
       WHERE u.id_usuario = $1`,
      [userId],
    );

    if (!currentDataResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const currentData = currentDataResult.rows[0];
    const ultimoCambio = currentData.registro_contraseña;
    const usernameActual = currentData.usuario;
    const nombreDeUsuario = username?.trim() || usernameActual;
    const nuevaPassword = nuevaContraseña?.trim();

    // Guardar la contraseña original ANTES de hashearla
    const contraseñaOriginal = nuevaPassword || null;
    let contraseñaCambio = false;

    if (nuevaPassword) {
      if (ultimoCambio) {
        const fechaUltimoCambio = new Date(ultimoCambio);
        const fechaActual = new Date();
        const diferenciaDias =
          (fechaActual - fechaUltimoCambio) / (1000 * 60 * 60 * 24);

        if (diferenciaDias < 15) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Debes esperar ${Math.ceil(15 - diferenciaDias)} días más para cambiar tu contraseña.`,
          });
        }
      }

      const hashedPassword = await generateHash(nuevaPassword);
      contraseñaCambio = true;

      await client.query(
        `UPDATE Usuarios
         SET Usuario = $1, Contraseña = $2, Registro_contraseña = CURRENT_TIMESTAMP
         WHERE id_usuario = $3`,
        [nombreDeUsuario, hashedPassword, userId],
      );
    } else {
      await client.query(
        "UPDATE Usuarios SET Usuario = $1 WHERE id_usuario = $2",
        [nombreDeUsuario, userId],
      );
    }

    await client.query(
      `UPDATE Emprendedor 
       SET Nombres = $1, Apellidos = $2, Correo = $3, Telefono = $4
       FROM Usuarios u
       WHERE Emprendedor.id_emprendedor = u.id_emprendedor 
       AND u.id_usuario = $5`,
      [nombres, apellidos, correo, telefono, userId],
    );

    await client.query("COMMIT");

    // Verificar si hubo cambios y enviar notificación si es necesario
    const cambios = {
      nombres: nombres !== currentData.nombres,
      apellidos: apellidos !== currentData.apellidos,
      correo: correo !== currentData.correo,
      telefono: telefono !== currentData.telefono,
      usuario: nombreDeUsuario !== currentData.usuario,
      contraseña: contraseñaCambio,
    };

    // Solo enviar notificación si hubo al menos un cambio
    if (Object.values(cambios).some((v) => v === true)) {
      // Usar la contraseña original si cambió
      const contraseñaParaCorreo = contraseñaCambio ? contraseñaOriginal : null;

      await notifyProfileModification(
        userId,
        {
          nombres,
          apellidos,
          correo,
          telefono,
          usuario: nombreDeUsuario,
          contraseña: contraseñaParaCorreo,
        },
        cambios,
        currentData.correo, // correo original por si cambió
      );
    }

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

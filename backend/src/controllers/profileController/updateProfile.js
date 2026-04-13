import pool from "../../database/connection.js";
import { generateHash } from "../../utils/security/generateHash.js";
import { notifyProfileModification } from "../../services/notifyProfileModification.js";
import { encrypt } from "../../utils/security/crypto.js"; 

export const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombres,
      apellidos,
      correo,
      telefono,
      username,
      nuevaContraseña,
      
      boxful_email,
      boxful_password, 
      boxful_address_id,
      boxful_allows_card_payment,
    } = req.body;

    const { userId } = req.params;

    await client.query("BEGIN");

    const currentDataResult = await client.query(
      `SELECT u.id_usuario, u.usuario, u.contraseña, u.registro_contraseña,
              e.nombres, e.apellidos, e.correo, e.telefono,
              emp.id_emprendimiento
       FROM Usuarios u
       LEFT JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
       LEFT JOIN Emprendimiento emp ON e.id_emprendimiento = emp.id_emprendimiento
       WHERE u.id_usuario = $1`,
      [userId],
    );

    if (!currentDataResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const currentData = currentDataResult.rows[0];
    const ultimoCambio = currentData.registro_contraseña;
    const usernameActual = currentData.usuario;
    const nombreDeUsuario = username?.trim() || usernameActual;
    const nuevaPassword = nuevaContraseña?.trim();
    const idEmprendimiento = currentData.id_emprendimiento;

    const contraseñaOriginal = nuevaPassword || null;
    let contraseñaCambio = false;

    // ── Actualizar Usuarios ──────────────────────────────────────────────
    if (nuevaPassword) {
      if (ultimoCambio) {
        const diferenciaDias =
          (new Date() - new Date(ultimoCambio)) / (1000 * 60 * 60 * 24);

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

    // ── Actualizar Emprendedor ───────────────────────────────────────────
    await client.query(
      `UPDATE Emprendedor 
       SET Nombres = $1, Apellidos = $2, Correo = $3, Telefono = $4
       FROM Usuarios u
       WHERE Emprendedor.id_emprendedor = u.id_emprendedor 
       AND u.id_usuario = $5`,
      [nombres, apellidos, correo, telefono, userId],
    );

    // ── Actualizar Emprendimiento (datos Boxful) ─────────────────────────
    if (idEmprendimiento) {
      let boxfulQuery = `
        UPDATE Emprendimiento
        SET
          boxful_email = $1,
          boxful_address_id = $2,
          boxful_allows_card_payment = $3
      `;
      
      let boxfulParams = [
        boxful_email?.trim() || null,
        boxful_address_id || null,
        boxful_allows_card_payment ?? true
      ];

      if (boxful_password) {
        const encryptedPassword = encrypt(boxful_password);
        boxfulQuery += `, boxful_password = $4 WHERE id_emprendimiento = $5`;
        boxfulParams.push(encryptedPassword, idEmprendimiento);
      } else {
        boxfulQuery += ` WHERE id_emprendimiento = $4`;
        boxfulParams.push(idEmprendimiento);
      }

      await client.query(boxfulQuery, boxfulParams);
    }

    await client.query("COMMIT");

    // ── Notificación de cambios ──────────────────────────────────────────
    const cambios = {
      nombres: nombres !== currentData.nombres,
      apellidos: apellidos !== currentData.apellidos,
      correo: correo !== currentData.correo,
      telefono: telefono !== currentData.telefono,
      usuario: nombreDeUsuario !== currentData.usuario,
      contraseña: contraseñaCambio,
    };

    if (Object.values(cambios).some((v) => v === true)) {
      await notifyProfileModification(
        userId,
        {
          nombres,
          apellidos,
          correo,
          telefono,
          usuario: nombreDeUsuario,
          contraseña: contraseñaCambio ? contraseñaOriginal : null,
        },
        cambios,
        currentData.correo,
      );
    }

    res.json({ success: true, message: "Perfil actualizado exitosamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
import pool from "../../database/connection.js";
import { generateHash } from "../../utils/hash/generateHash.js";

export const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombres, apellidos, correo, telefono, username, nuevaContraseña } =
      req.body;
    const { userId } = req.params;

    await client.query("BEGIN");

    // Obtener datos actuales del usuario para usar como respaldo
    const userResult = await client.query(
      "SELECT Usuario, Registro_contraseña FROM Usuarios WHERE id_usuario = $1",
      [userId]
    );

    if (!userResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const ultimoCambio = userResult.rows[0]?.registro_contraseña;
    const usernameActual = userResult.rows[0]?.usuario;
    const nombreDeUsuario = username?.trim() || usernameActual;
    const nuevaPassword = nuevaContraseña?.trim();

    //  Lógica de Cambio de Contraseña
    if (nuevaPassword) {
      // Si existe una fecha previa, validamos los 15 días
      if (ultimoCambio) {
        const fechaUltimoCambio = new Date(ultimoCambio);
        const fechaActual = new Date();
        // Diferencia en milisegundos -> días
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

      await client.query(
        `UPDATE Usuarios
                 SET Usuario = $1, Contraseña = $2, Registro_contraseña = CURRENT_TIMESTAMP
                 WHERE id_usuario = $3`,
        [nombreDeUsuario, hashedPassword, userId]
      );
    } else {
      // Solo actualizar username si no hay cambio de pass
      await client.query(
        "UPDATE Usuarios SET Usuario = $1 WHERE id_usuario = $2",
        [nombreDeUsuario, userId]
      );
    }

    // Actualizar Datos Personales (Emprendedor)
    await client.query(
      `
            UPDATE Emprendedor 
            SET Nombres = $1, Apellidos = $2, Correo = $3, Telefono = $4
            FROM Usuarios u
            WHERE Emprendedor.id_emprendedor = u.id_emprendedor 
            AND u.id_usuario = $5
            `,
      [nombres, apellidos, correo, telefono, userId]
    );

    await client.query("COMMIT");

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

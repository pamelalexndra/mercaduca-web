import pool from "../../database/connection.js";

export const deleteProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = req.params.userId;

    const userResult = await client.query(
      `SELECT id_emprendedor FROM Usuarios WHERE id_usuario = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idEmprendedor = userResult.rows[0].id_emprendedor;

    if (idEmprendedor) {
      const emprendimientosResult = await client.query(
        `SELECT id_emprendimiento FROM Emprendedor WHERE id_emprendedor = $1`,
        [idEmprendedor]
      );

      const emprendimientosIds = emprendimientosResult.rows.map(
        (row) => row.id_emprendimiento
      );

      if (emprendimientosIds.length > 0) {
        await client.query(
          `DELETE FROM Producto WHERE id_emprendimiento = ANY($1)`,
          [emprendimientosIds]
        );

        await client.query(
          `DELETE FROM Emprendimiento WHERE id_emprendimiento = ANY($1)`,
          [emprendimientosIds]
        );
      }

      await client.query(`DELETE FROM Emprendedor WHERE id_emprendedor = $1`, [
        idEmprendedor,
      ]);
    }

    const usuarioEliminado = await client.query(
      `DELETE FROM Usuarios WHERE id_usuario = $1 RETURNING id_usuario, Usuario`,
      [userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Perfil eliminado exitosamente",
      usuario: usuarioEliminado.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando perfil:", error);
    res.status(500).json({ error: "Error eliminando perfil" });
  } finally {
    client.release();
  }
};

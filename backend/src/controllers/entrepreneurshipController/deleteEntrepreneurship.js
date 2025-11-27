import pool from "../../database/connection.js";

export const deleteEntrepreneurship = async (req, res) => {
  // cliente del pool para manejar la transacción
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    const idEmprendimiento = parseInt(id);

    // Iniciar la transacción
    await client.query("BEGIN");

    // Desactivar el Emprendimiento (Borrado Lógico)
    const resultEmprendimiento = await client.query(
      `
      UPDATE Emprendimiento 
      SET Disponible = false 
      WHERE id_emprendimiento = $1
      RETURNING id_emprendimiento, Nombre
      `,
      [idEmprendimiento]
    );

    if (resultEmprendimiento.rows.length === 0) {
      // Si no existe, hacemos rollback y retornamos error
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    // Desactivar todos los Productos asociados (Cascada Manual)
    const resultProductos = await client.query(
      `
      UPDATE Producto 
      SET Disponible = false 
      WHERE id_emprendimiento = $1 AND Disponible = true
      `,
      [idEmprendimiento]
    );

    // confirmar
    await client.query("COMMIT");

    res.json({
      message: "Emprendimiento y sus productos eliminados exitosamente",
      emprendimiento: resultEmprendimiento.rows[0],
      productos_desactivados: resultProductos.rowCount, 
    });

  } catch (error) {
    // si algo falla, deshacemos todo
    await client.query("ROLLBACK");
    console.error("Error eliminando emprendimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    // Liberar el cliente de vuelta al pool
    client.release();
  }
};
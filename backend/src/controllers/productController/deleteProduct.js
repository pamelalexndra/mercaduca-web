import pool from "../../database/connection.js";

export const deleteProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const idProducto = parseInt(id);

    await client.query("BEGIN");

    const result = await client.query(
      `
      DELETE FROM Producto 
      WHERE id_producto = $1
      RETURNING id_producto, Nombre
      `,
      [idProducto]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await client.query("COMMIT");

    res.json({
      message: "Producto eliminado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
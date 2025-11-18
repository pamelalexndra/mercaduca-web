import pool from "../../database/connection.js";

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    // Borrado lógico en lugar de DELETE físico
    const result = await pool.query(
      `
            UPDATE Producto 
            SET Disponible = false 
            WHERE id_producto = $1
            RETURNING id_producto, Nombre
        `,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: "Producto eliminado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

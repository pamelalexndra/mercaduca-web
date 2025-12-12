import pool from "../../database/connection.js";

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria } = req.body;
    
    if (!categoria) {
      return res.status(400).json({
        error: "El campo 'categoria' es requerido"
      });
    }

    const result = await pool.query(
      "UPDATE categorias SET categoria = $1 WHERE id_categoria = $2 RETURNING *",
      [categoria, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Categoría no encontrada"
      });
    }

    res.json({
      message: "Categoría actualizada exitosamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      error: "Error al actualizar categoría",
      details: error.message
    });
  }
};
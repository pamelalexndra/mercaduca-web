import pool from "../../database/connection.js";

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "DELETE FROM categorias WHERE id_categoria = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Categoría no encontrada"
      });
    }

    res.json({
      message: "Categoría eliminada exitosamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    
    if (error.code === '23503') {
      return res.status(409).json({
        error: "No se puede eliminar la categoría porque está siendo utilizada en otras tablas"
      });
    }

    res.status(500).json({
      error: "Error al eliminar categoría",
      details: error.message
    });
  }
};
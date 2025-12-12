import pool from "../../database/connection.js";

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "SELECT * FROM categorias WHERE id_categoria = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Categoría no encontrada"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      error: "Error al obtener categoría",
      details: error.message
    });
  }
};
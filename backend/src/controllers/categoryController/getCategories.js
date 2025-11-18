import pool from "../../database/connection.js";

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categorias ORDER BY id_categoria"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Error al obtener categorías",
      details: error.message,
    });
  }
};

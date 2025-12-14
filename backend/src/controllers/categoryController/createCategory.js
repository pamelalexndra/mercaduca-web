import pool from "../../database/connection.js";

export const createCategory = async (req, res) => {
  try {
    const { categoria } = req.body;

    if (!categoria) {
      return res.status(400).json({
        error: "El campo 'categoria' es requerido",
      });
    }

    const result = await pool.query(
      "INSERT INTO categorias (categoria) VALUES ($1) RETURNING *",
      [categoria]
    );

    res.status(201).json({
      message: "Categoría creada exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      error: "Error al crear categoría",
      details: error.message,
    });
  }
};

import pool from "../../database/connection.js";

export const createActivity = async (req, res) => {
  try {
    const { nombre, descripcion, imagen_url } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El campo 'nombre' es requerido",
      });
    }

    const result = await pool.query(
      "INSERT INTO actividades (nombre, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *",
      [nombre, descripcion || null, imagen_url || null]
    );

    res.status(201).json({
      message: "Actividad creada exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({
      error: "Error al crear actividad",
      details: error.message,
    });
  }
};

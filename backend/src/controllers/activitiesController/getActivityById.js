import pool from "../../database/connection.js";

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM actividades WHERE id_actividad = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({
      error: "Error al obtener actividad",
      details: error.message,
    });
  }
};

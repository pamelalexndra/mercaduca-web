import pool from "../../database/connection.js";

export const getActivity = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM actividades ORDER BY id_actividad"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      error: "Error al obtener actividades",
      details: error.message,
    });
  }
};

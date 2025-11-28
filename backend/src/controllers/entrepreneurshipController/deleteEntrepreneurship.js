import pool from "../../database/connection.js";

export const deleteEntrepreneurship = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    const result = await pool.query(
      `DELETE FROM Emprendimiento WHERE id_emprendimiento = $1 RETURNING id_emprendimiento, Nombre`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json({
      message: "Emprendimiento y todos sus datos asociados eliminados",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error eliminando emprendimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
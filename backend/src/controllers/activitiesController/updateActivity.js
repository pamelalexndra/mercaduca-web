import pool from "../../database/connection.js";

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen_url } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El campo 'nombre' es requerido",
      });
    }

    const result = await pool.query(
      `UPDATE actividades 
       SET nombre = $1, 
           descripcion = $2, 
           imagen_url = $3 
       WHERE id_actividad = $4 
       RETURNING *`,
      [nombre, descripcion || null, imagen_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json({
      message: "Actividad actualizada exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({
      error: "Error al actualizar actividad",
      details: error.message,
    });
  }
};

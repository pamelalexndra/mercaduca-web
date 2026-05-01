import pool from "../../database/connection.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la actividad para saber la URL de la imagen
    const activityResult = await pool.query(
      "SELECT imagen_url FROM actividades WHERE id_actividad = $1",
      [id],
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    const imagenUrl = activityResult.rows[0].imagen_url;

    const result = await pool.query(
      "DELETE FROM actividades WHERE id_actividad = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    // Eliminar la imagen de Cloudinary si existe
    if (imagenUrl) {
      try {
        await deleteImageByUrl(imagenUrl);
      } catch (cloudinaryError) {
        // No fallamos la eliminación de la actividad si hay error en Cloudinary
      }
    }

    res.json({
      message: "Actividad eliminada exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting activity:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        error:
          "No se puede eliminar la actividad porque está siendo utilizada en otras tablas",
      });
    }

    res.status(500).json({
      error: "Error al eliminar actividad",
      details: error.message,
    });
  }
};
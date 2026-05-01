import pool from "../../database/connection.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El campo 'nombre' es requerido",
      });
    }

    // Obtener la actividad actual para saber la imagen existente
    const currentActivity = await pool.query(
      "SELECT imagen_url FROM actividades WHERE id_actividad = $1",
      [id],
    );

    if (currentActivity.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    let imagen_url = currentActivity.rows[0].imagen_url;

    if (req.file) {
      // Si hay una imagen nueva, eliminar la anterior de Cloudinary
      if (currentActivity.rows[0].imagen_url) {
        try {
          await deleteImageByUrl(currentActivity.rows[0].imagen_url);
        } catch (error) {
          // No fallamos la actualización si no se pudo eliminar la imagen anterior
        }
      }
      const result = await uploadToCloudinary(req.file.buffer, "actividades");
      imagen_url = result.secure_url;
    }

    const dbResult = await pool.query(
      `UPDATE actividades 
       SET nombre = $1, 
           descripcion = $2, 
           imagen_url = $3 
       WHERE id_actividad = $4 
       RETURNING *`,
      [nombre, descripcion || null, imagen_url, id],
    );

    if (dbResult.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json({
      message: "Actividad actualizada exitosamente",
      data: dbResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({
      error: "Error al actualizar actividad",
      details: error.message,
    });
  }
};
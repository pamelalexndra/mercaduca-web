import pool from "../../database/connection.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";

export const createActivity = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El campo 'nombre' es requerido",
      });
    }

    let imagen_url = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "actividades");
      imagen_url = result.secure_url;
    } else {
      return res.status(400).json({
        error: "La imagen es obligatoria",
      });
    }

    const result = await pool.query(
      "INSERT INTO actividades (nombre, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *",
      [nombre, descripcion || null, imagen_url],
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
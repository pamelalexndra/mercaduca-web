import pool from "../../database/connection.js";
import { buildEntrepreneurshipQueryUpdate } from "../../utils/builders/entrepreneurshipQueryBuilder.js";

export const updateEntrepreneurshipPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    const { query, params, count } = buildEntrepreneurshipQueryUpdate(
      id,
      updates
    );

    if (count === 0) {
      return res
        .status(400)
        .json({ error: "No hay campos válidos para actualizar" });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando emprendimiento:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};

import pool from "../../database/connection.js";
import { buildEntrepreneurshipQueryUpdate } from "../../utils/builders/entrepreneurshipQueryBuilder.js";
import { encrypt } from "../../utils/security/crypto.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const updateEntrepreneurshipPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (req.file) {
      const current = await pool.query(
        "SELECT Imagen_URL FROM Emprendimiento WHERE id_emprendimiento = $1",
        [parseInt(id)],
      );

      if (current.rows.length > 0 && current.rows[0].imagen_url) {
        try {
          await deleteImageByUrl(current.rows[0].imagen_url);
        } catch (error) {
          // No fallamos la actualización
        }
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        "emprendimientos",
      );
      updates.imagen_url = result.secure_url;
    }

    if (Object.keys(updates).length === 0 && !req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    if (updates.boxful_password) {
      updates.boxful_password = encrypt(updates.boxful_password);
    }

    const { query, params, count } = buildEntrepreneurshipQueryUpdate(
      id,
      updates,
    );

    if (count === 0 && !req.file) {
      return res
        .status(400)
        .json({ error: "No hay campos válidos para actualizar" });
    }

    if (count === 0 && req.file) {
      const result = await pool.query(
        `UPDATE Emprendimiento 
         SET Imagen_URL = $1 
         WHERE id_emprendimiento = $2 
         RETURNING *`,
        [updates.imagen_url, parseInt(id)],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Emprendimiento no encontrado" });
      }

      return res.json({
        message: "Emprendimiento actualizado exitosamente",
        emprendimiento: result.rows[0],
      });
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
    if (error.code === "23503")
      return res.status(400).json({ error: "Categoría no válida" });
    if (error.code === "23505")
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
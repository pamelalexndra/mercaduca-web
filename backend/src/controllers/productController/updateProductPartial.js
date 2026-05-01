import pool from "../../database/connection.js";
import { buildProductQueryUpdate } from "../../utils/builders/productQueryBuilder.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const updateProductPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    if (req.file) {
      const current = await pool.query(
        "SELECT Imagen_URL FROM Producto WHERE id_producto = $1",
        [parseInt(id)],
      );

      if (current.rows.length > 0 && current.rows[0].imagen_url) {
        try {
          await deleteImageByUrl(current.rows[0].imagen_url);
        } catch (error) {
          // No fallamos la actualización
        }
      }

      const result = await uploadToCloudinary(req.file.buffer, "productos");
      updates.imagen_url = result.secure_url;
    }

    if (Object.keys(updates).length === 0 && !req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    const { query, params, count } = buildProductQueryUpdate(id, updates);

    if (count === 0 && !req.file) {
      return res
        .status(400)
        .json({ error: "No hay campos válidos para actualizar" });
    }

    if (count === 0 && req.file) {
      const result = await pool.query(
        `UPDATE Producto 
         SET Imagen_URL = $1 
         WHERE id_producto = $2 
         RETURNING *`,
        [updates.imagen_url, parseInt(id)],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      return res.json({
        message: "Producto actualizado exitosamente",
        producto: result.rows[0],
      });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
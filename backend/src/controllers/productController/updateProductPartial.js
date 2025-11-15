import pool from "../../database/db.js";
import { buildProductQueryUpdate } from "../../utils/productQueryBuilder.js";

export const updateProductPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Validaciones iniciales simples
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }

    // 2. Usar la utilidad para construir la query
    const { query, params, count } = buildProductQueryUpdate(id, updates);

    // Si count es 0, significa que enviaron campos en el body, pero ninguno era válido (ej: enviaron { "campo_falso": 1 })
    if (count === 0) {
      return res.status(400).json({ error: "No hay campos válidos para actualizar" });
    }

    // 3. Ejecutar Query
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
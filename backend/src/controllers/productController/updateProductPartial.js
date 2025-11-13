import pool from "../../database/db.js";

export const updateProductPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    // Construir query dinámicamente
    const allowedFields = [
      "nombre",
      "descripcion",
      "imagen_url",
      "precio_dolares",
      "existencias",
      "disponible",
      "id_categoria",
    ];
    const setParts = [];
    const params = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        let dbField = key;
        if (key === "precio_dolares") dbField = "Precio_dolares";
        if (key === "imagen_url") dbField = "Imagen_URL";
        if (key === "id_categoria") dbField = "id_categoria";

        setParts.push(`${dbField} = $${paramCount}`);

        // Conversiones de tipo
        if (key === "precio_dolares") params.push(parseFloat(value));
        else if (key === "existencias" || key === "id_categoria")
          params.push(parseInt(value));
        else if (key === "disponible") params.push(Boolean(value));
        else params.push(value?.toString().trim() || "");

        paramCount++;
      }
    }

    if (setParts.length === 0) {
      return res
        .status(400)
        .json({ error: "No hay campos válidos para actualizar" });
    }

    params.push(parseInt(id));

    const result = await pool.query(
      `
            UPDATE Producto 
            SET ${setParts.join(", ")}
            WHERE id_producto = $${paramCount}
            RETURNING *
           `,
      params
    );

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
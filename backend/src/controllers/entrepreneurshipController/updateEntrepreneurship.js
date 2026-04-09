import pool from "../../database/connection.js";

export const updateEntrepreneurship = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      imagen_url,
      instagram,
      disponible,
      id_categoria,
      boxful_city_id,
      boxful_state_id,
      direccion_recoleccion,
      referencia_recoleccion,
      boxful_allows_card_payment,
      boxful_courier_id,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    const emprendimientoCheck = await pool.query(
      "SELECT id_emprendimiento FROM Emprendimiento WHERE id_emprendimiento = $1",
      [parseInt(id)]
    );

    if (emprendimientoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    const result = await pool.query(
      `UPDATE Emprendimiento 
       SET 
         Nombre                    = $1,
         Descripcion               = $2,
         Imagen_URL                = $3,
         Instagram                 = $4,
         Disponible                = $5,
         id_categoria              = $6,
         boxful_city_id            = $7,
         boxful_state_id           = $8,
         direccion_recoleccion     = $9,
         referencia_recoleccion    = $10,
         boxful_allows_card_payment = $11,
         boxful_courier_id         = $12
       WHERE id_emprendimiento     = $13
       RETURNING *`,
      [
        nombre?.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        instagram?.trim() || "",
        disponible !== undefined ? disponible : true,
        id_categoria ? parseInt(id_categoria) : null,
        boxful_city_id || null,
        boxful_state_id || null,
        direccion_recoleccion?.trim() || null,
        referencia_recoleccion?.trim() || null,
        boxful_allows_card_payment ?? true,
        boxful_courier_id?.trim() || null,
        parseInt(id),
      ]
    );

    res.json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando emprendimiento:", error);
    if (error.code === "23503") return res.status(400).json({ error: "Categoría no válida" });
    if (error.code === "23505") return res.status(400).json({ error: "Ya existe un emprendimiento con ese nombre" });
    console.error("ERROR: ", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
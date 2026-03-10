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
      // Campos de envíos
      boxful_city_id,
      direccion_recoleccion,
      referencia_recoleccion,
      telefono, // teléfono del perfil del emprendedor
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    const emprendimientoCheck = await pool.query(
      "SELECT id_emprendimiento, boxful_address_id FROM Emprendimiento WHERE id_emprendimiento = $1",
      [parseInt(id)]
    );

    if (emprendimientoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    // Registrar o actualizar dirección en Boxful si vienen los datos necesarios
    let boxful_address_id = emprendimientoCheck.rows[0].boxful_address_id || null;

    if (boxful_city_id && direccion_recoleccion?.trim()) {
      try {
        const addressData = await createAddress({
          address: direccion_recoleccion.trim(),
          referencePoint: referencia_recoleccion?.trim() || direccion_recoleccion.trim(),
          cityId: boxful_city_id,
          addressPhone: telefono || "",
          addressAreaCode: "503",
          // Coordenadas de El Salvador como fallback genérico
          latitude: 13.6929,
          longitude: -89.2182,
        });
        boxful_address_id = addressData?.id || boxful_address_id;
      } catch (boxfulError) {
        // Si falla Boxful, no bloqueamos el guardado — solo logueamos
        console.error("No se pudo registrar dirección en Boxful:", boxfulError.message);
      }
    }

    const result = await pool.query(
      `UPDATE Emprendimiento 
       SET 
         Nombre                 = $1,
         Descripcion            = $2,
         Imagen_URL             = $3,
         Instagram              = $4,
         Disponible             = $5,
         id_categoria           = $6,
         boxful_city_id         = $7,
         boxful_address_id      = $8,
         direccion_recoleccion  = $9,
         referencia_recoleccion = $10
       WHERE id_emprendimiento  = $11
       RETURNING *`,
      [
        nombre?.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        instagram?.trim() || "",
        disponible !== undefined ? disponible : true,
        id_categoria ? parseInt(id_categoria) : null,
        boxful_city_id || null,
        boxful_address_id,
        direccion_recoleccion?.trim() || null,
        referencia_recoleccion?.trim() || null,
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
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
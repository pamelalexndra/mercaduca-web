import pool from "../../database/connection.js";

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      imagen_url,
      precio_dolares,
      disponible,
      id_categoria,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const productoCheck = await pool.query(
      "SELECT id_producto FROM Producto WHERE id_producto = $1",
      [parseInt(id)]
    );

    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const result = await pool.query(
      `
            UPDATE Producto 
                SET 
                Nombre = $1,
                Descripcion = $2,
                Imagen_URL = $3,
                Precio_dolares = $4,
                Disponible = $5,
                id_categoria = $6
            WHERE id_producto = $7
            RETURNING *
            `,
      [
        nombre?.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        parseFloat(precio_dolares),
        disponible !== undefined ? disponible : true,
        id_categoria ? parseInt(id_categoria) : null,
        parseInt(id),
      ]
    );

    res.json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
import pool from "../../database/db.js";

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const result = await pool.query(
      `
      SELECT 
        p.id_producto AS id, 
        p.Nombre AS nombre,
        p.Descripcion AS descripcion,
        p.Imagen_URL AS imagen,
        p.Precio_dolares AS precio,
        p.Existencias AS stock,
        p.Disponible AS disponible,
        p.Fecha_registro,
        p.id_categoria,
        p.id_emprendimiento,
        c.Categoria AS categoria,
        e.Nombre as nombre_emprendimiento
      FROM Producto p
      JOIN Categorias c ON p.id_categoria = c.id_categoria
      JOIN Emprendimiento e ON p.id_emprendimiento = e.id_emprendimiento
      WHERE p.id_producto = $1
    `,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ producto: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
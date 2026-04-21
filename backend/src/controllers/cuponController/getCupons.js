import pool from "../../database/connection.js";

export const getCupons = async (req, res) => {
  try {
    const { id_emprendimiento, id_categoria, id_producto, solo_disponibles } =
      req.query;

    let query = `
      SELECT
        c.*,
        e.Nombre       AS emprendimiento_nombre,
        cat.Categoria  AS categoria_nombre,
        p.Nombre       AS producto_nombre,
        CASE
          WHEN c.id_producto  IS NOT NULL THEN 'producto'
          WHEN c.id_categoria IS NOT NULL THEN 'categoria'
          ELSE 'emprendimiento'
        END AS alcance
      FROM Cupon c
      LEFT JOIN Emprendimiento e  ON c.id_emprendimiento = e.id_emprendimiento
      LEFT JOIN Categorias    cat ON c.id_categoria      = cat.id_categoria
      LEFT JOIN Producto      p  ON c.id_producto       = p.id_producto
      WHERE 1=1
    `;
    const params = [];

    if (id_emprendimiento) {
      params.push(id_emprendimiento);
      query += ` AND c.id_emprendimiento = $${params.length}`;
    }
    if (id_categoria) {
      params.push(id_categoria);
      query += ` AND c.id_categoria = $${params.length}`;
    }
    if (id_producto) {
      params.push(id_producto);
      query += ` AND c.id_producto = $${params.length}`;
    }
    if (solo_disponibles === "true") {
      query += ` AND c.Disponible = TRUE`;
      query += ` AND (c.Fecha_limite IS NULL OR c.Fecha_limite > NOW())`;
    }

    query += ` ORDER BY c.Fecha_creacion DESC`;

    const { rows } = await pool.query(query, params);
    res.json({ cupones: rows });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
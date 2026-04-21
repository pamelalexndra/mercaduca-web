import pool from "../../database/connection.js";

export const getCuponsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
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
       WHERE c.id_cupon = $1`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    res.json({ cupon: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
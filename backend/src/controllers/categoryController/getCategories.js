import pool from "../../database/connection.js";

export const getCategories = async (req, res) => {
  const { available } = req.query;
  const isAvailable = (available || "").toString().toLowerCase() === "true";

  try {
    let query;

    if (isAvailable) {
      query = `
        SELECT 
          c.id_categoria, 
          c.categoria, 
          COALESCE(COUNT(DISTINCT p.id_producto), 0)::INT as cantidad_productos,
          COALESCE(COUNT(DISTINCT e.id_emprendimiento), 0)::INT as cantidad_emprendimientos
        FROM categorias as c
        LEFT JOIN Producto as p ON c.id_categoria = p.id_categoria
        LEFT JOIN Emprendimiento as e ON c.id_categoria = e.id_categoria
        GROUP BY c.id_categoria, c.categoria
        HAVING COALESCE(COUNT(DISTINCT p.id_producto), 0) > 0 
           OR COALESCE(COUNT(DISTINCT e.id_emprendimiento), 0) > 0
        ORDER BY c.categoria;
      `;
    } else {
      query = `
        SELECT 
          c.id_categoria, 
          c.categoria, 
          COALESCE(COUNT(DISTINCT p.id_producto), 0)::INT as cantidad_productos,
          COALESCE(COUNT(DISTINCT e.id_emprendimiento), 0)::INT as cantidad_emprendimientos
        FROM categorias as c
        LEFT JOIN Producto as p ON c.id_categoria = p.id_categoria
        LEFT JOIN Emprendimiento as e ON c.id_categoria = e.id_categoria
        GROUP BY c.id_categoria, c.categoria
        ORDER BY c.categoria;
      `;
    }

    const result = await pool.query(query);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al obtener categorías",
      message: error.message,
    });
  }
};

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
          COUNT(p.id_producto)::INT as cantidad_productos
        FROM categorias c
        INNER JOIN Producto p ON c.id_categoria = p.id_categoria
        GROUP BY c.id_categoria, c.categoria
        ORDER BY c.categoria;
      `;
    } else {
      query = `
        SELECT 
          c.id_categoria, 
          c.categoria, 
          COUNT(p.id_producto)::INT as cantidad_productos
        FROM categorias c
        LEFT JOIN Producto p ON c.id_categoria = p.id_categoria
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
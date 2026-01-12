import pool from "../../database/connection.js";

export const getProductsByCategory = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id_categoria,
        c.Categoria,
        COUNT(p.id_producto) AS cantidad_productos
      FROM Categorias c
      LEFT JOIN Producto p ON c.id_categoria = p.id_categoria
      GROUP BY c.id_categoria, c.Categoria
      ORDER BY c.Categoria;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error obteniendo productos por categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos por categoría",
      error: error.message,
    });
  }
};

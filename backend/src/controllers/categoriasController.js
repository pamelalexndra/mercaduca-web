import pool from "../database/db.js";

export const getCategorias = async (req, res) => {
  const available = (req.query.available || "").toString().toLowerCase() === "true";
  
  try {
    let query;
    
    if (available) {
      // Si available=true, solo categorías con productos
      query = `
        SELECT c.id_categoria, c.categoria
        FROM categorias c
        WHERE EXISTS (
          SELECT 1 FROM producto p
          WHERE p.id_categoria = c.id_categoria
        )
        ORDER BY c.categoria;
      `;
    } else {
      // Todas las categorías
      query = `
        SELECT id_categoria, categoria
        FROM categorias
        ORDER BY categoria;
      `;
    }
    
    const result = await pool.query(query);
    
    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows  
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al obtener categorías",
      message: error.message,
    });
  }
};
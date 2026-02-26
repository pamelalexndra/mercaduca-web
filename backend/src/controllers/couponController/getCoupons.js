import pool from "../../database/connection.js";

export const getCoupons = async (req, res) => {
  try {
    const { orden } = req.query;

    const sortOrder = orden && orden.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const query = `

    `;

    const result = await pool.query(query);

    res.json({
      coupons: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error obteniendo listado de cupones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

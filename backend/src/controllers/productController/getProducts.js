import pool from "../../database/connection.js";
import { buildProductQuery } from "../../utils//builders/productQueryBuilder.js";

export const getProducts = async (req, res) => {
  try {
    const { query, params, filtrosAplicados } = buildProductQuery(req.query);

    const result = await pool.query(query, params);

    res.json({
      productos: result.rows,
      total: result.rows.length,
      filtros:
        Object.keys(filtrosAplicados).length > 0 ? filtrosAplicados : "ninguno",
    });
  } catch (error) {
    console.error("Error en getProducts:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener productos" });
  }
};

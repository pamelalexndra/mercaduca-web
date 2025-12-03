import pool from "../../database/connection.js";
import { buildEntrepreneurshipQuery } from "../../utils/builders/entrepreneurshipQueryBuilder.js";

export const getEntrepreneurship = async (req, res) => {
  try {
    const { query, params, filtrosAplicados } = buildEntrepreneurshipQuery(
      req.query
    );

    const result = await pool.query(query, params);

    res.json({
      emprendimientos: result.rows,
      total: result.rows.length,
      filtros: Object.keys(filtrosAplicados).length
        ? filtrosAplicados
        : "ninguno",
    });
  } catch (error) {
    console.error("Error obteniendo emprendimientos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

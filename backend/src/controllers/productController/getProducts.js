import pool from "../../database/connection.js";
// Asegúrate de que la ruta relativa sea correcta según donde guardaste el archivo utils
import { buildProductQuery } from "../../utils//builders/productQueryBuilder.js";

export const getProducts = async (req, res) => {
  try {
    // 1. Delegamos la construcción compleja a la utilidad
    const { query, params, filtrosAplicados } = buildProductQuery(
      req.query
    );

    // 2. Ejecutar la consulta
    const result = await pool.query(query, params);

    // 3. Responder
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
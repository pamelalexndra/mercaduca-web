import pool from "../../database/db.js";
import { buildEntrepreneurshipQuery } from "../../utils/entrepreneurshipQueryBuilder.js";

export const getEntrepreneurship = async (req, res) => {
    try {
        // 1. Construir consulta usando la utilidad
        const { query, params, filtrosAplicados } = buildEntrepreneurshipQuery(req.query);

        // 2. Ejecutar consulta
        const result = await pool.query(query, params);

        // 3. Responder
        res.json({
            emprendimientos: result.rows,
            total: result.rows.length,
            filtros: Object.keys(filtrosAplicados).length ? filtrosAplicados : "ninguno",
        });
    } catch (error) {
        console.error("Error obteniendo emprendimientos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
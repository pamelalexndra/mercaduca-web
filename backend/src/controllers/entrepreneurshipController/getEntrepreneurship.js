import pool from "../../database/db.js";

export const getEntrepreneurship = async (req, res) => {
    try {
        // Log de diagnóstico
        const dbCheck = await pool.query(
            "SELECT NOW() as time, COUNT(*) as total FROM emprendimiento WHERE disponible = true"
        );
        console.log(
            "Conexión BD:",
            dbCheck.rows[0].time,
            "Total emprendimientos:",
            dbCheck.rows[0].total
        );

        // Parámetros con valores por defecto
        const { ids, ordenar = "fecha_desc" } = req.query;

        const queryParts = [
            `SELECT
                e.id_emprendimiento AS id,
                e.Nombre AS nombre,
                e.Descripcion AS descripcion,
                e.Imagen_URL AS imagen,
                e.Instagram AS instagram,
                e.Fecha_registro,
                c.id_categoria AS categoria_id,
                c.Categoria AS categoria_nombre
            FROM Emprendimiento e
            JOIN Categorias c ON e.id_categoria = c.id_categoria
            WHERE e.Disponible = true`,
        ];

        const params = []; // Array para almacenar los parámetros de la consulta
        const filtros = {}; // Objeto para almacenar los filtros

        // Filtro por categorías
        if (ids) {
            const categoriasIds = ids
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => id > 0);
            if (categoriasIds.length > 0) {
                const placeholders = categoriasIds
                    .map((_, i) => `$${params.length + i + 1}`)
                    .join(",");
                queryParts.push(` AND e.id_categoria IN (${placeholders})`);
                params.push(...categoriasIds);
                filtros.categorias = categoriasIds;
            }
        }

        // Ordenamiento
        const ordenamientos = {
            fecha_desc: "e.Fecha_registro DESC",
            fecha_asc: "e.Fecha_registro ASC",
            nombre_asc: "e.Nombre ASC",
            nombre_desc: "e.Nombre DESC",
        };

        queryParts.push(
            `ORDER BY ${ordenamientos[ordenar] || ordenamientos.fecha_desc}`
        );
        filtros.ordenamiento = ordenar;

        // Ejecutar consulta
        const query = queryParts.join(" ");
        const result = await pool.query(query, params);

        res.json({
            emprendimientos: result.rows,
            total: result.rows.length,
            filtros: Object.keys(filtros).length ? filtros : "ninguno",
        });
    } catch (error) {
        console.error("Error obteniendo emprendimientos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
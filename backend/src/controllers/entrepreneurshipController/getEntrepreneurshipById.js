import pool from "../../database/connection.js";

export const getEntrepreneurshipById = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    try {
        const query = `
      SELECT 
        e.id_emprendimiento,
        e.nombre, 
        e.descripcion,
        e.Imagen_URL as imagen_url,
        e.instagram,
        em.correo,
        em.telefono
      FROM emprendimiento e
      LEFT JOIN emprendedor em
        ON e.id_emprendimiento = em.id_emprendimiento
      WHERE e.id_emprendimiento = $1
      LIMIT 1;
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Emprendimiento no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener el emprendimiento:", error);
        res.status(500).json({
            error: "Error al obtener emprendimiento",
            details: error.message,
        });
    }
};
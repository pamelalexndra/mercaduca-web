import pool from "../../database/db.js";

export const getProfiles = async (req, res) => {
    try {
        // Obtenemos el parámetro de orden (por defecto, mas recientes primero)
        const { orden } = req.query;

        const sortOrder = (orden && orden.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const query = `
      SELECT 
        u.id_usuario, 
        u.Usuario, 
        ed.id_emprendedor,
        ed.Nombres, 
        ed.Apellidos, 
        ed.Correo, 
        ed.Telefono,
        ed.Activo,
        ed.Fecha_registro,
        ed.id_emprendimiento -- Útil para saber si ya tiene un negocio vinculado
      FROM Usuarios u
      JOIN Emprendedor ed ON u.id_emprendedor = ed.id_emprendedor
      ORDER BY ed.Fecha_registro ${sortOrder}
    `;

        const result = await pool.query(query);

        res.json({
            perfiles: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error("Error obteniendo listado de perfiles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
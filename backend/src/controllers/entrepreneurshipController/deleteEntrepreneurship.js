import pool from "../../database/connection.js";

export const deleteEntrepreneurship = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID de emprendimiento inválido" });
        }

        // Verificar si el emprendimiento tiene productos activos
        const productosCheck = await pool.query(
            "SELECT COUNT(*) as count FROM Producto WHERE id_emprendimiento = $1 AND Disponible = true",
            [parseInt(id)]
        );

        if (parseInt(productosCheck.rows[0].count) > 0) {
            return res.status(400).json({
                error:
                    "No se puede eliminar el emprendimiento porque tiene productos activos. Elimine primero los productos.",
            });
        }

        // Borrado lógico
        const result = await pool.query(
            `
            UPDATE Emprendimiento 
            SET Disponible = false 
            WHERE id_emprendimiento = $1
            RETURNING id_emprendimiento, Nombre
        `,
            [parseInt(id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Emprendimiento no encontrado" });
        }

        res.json({
            message: "Emprendimiento eliminado exitosamente",
            emprendimiento: result.rows[0],
        });
    } catch (error) {
        console.error("Error eliminando emprendimiento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

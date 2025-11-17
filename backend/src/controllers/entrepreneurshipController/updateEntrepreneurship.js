import pool from "../../database/connection.js";

export const updateEntrepreneurship = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            imagen_url,
            instagram,
            disponible,
            id_categoria,
        } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID de emprendimiento inválido" });
        }

        // Verificar que el emprendimiento existe
        const emprendimientoCheck = await pool.query(
            "SELECT id_emprendimiento FROM Emprendimiento WHERE id_emprendimiento = $1",
            [parseInt(id)]
        );

        if (emprendimientoCheck.rows.length === 0) {
            return res.status(404).json({ error: "Emprendimiento no encontrado" });
        }

        // Actualizar emprendimiento
        const result = await pool.query(
            `
            UPDATE Emprendimiento 
            SET 
            Nombre = $1,
            Descripcion = $2,
            Imagen_URL = $3,
            Instagram = $4,
            Disponible = $5,
            id_categoria = $6
            WHERE id_emprendimiento = $7
            RETURNING *
    `,
            [
                nombre?.trim(),
                descripcion?.trim() || "",
                imagen_url?.trim() || "",
                instagram?.trim() || "",
                disponible !== undefined ? disponible : true,
                id_categoria ? parseInt(id_categoria) : null,
                parseInt(id),
            ]
        );

        res.json({
            message: "Emprendimiento actualizado exitosamente",
            emprendimiento: result.rows[0],
        });
    } catch (error) {
        console.error("Error actualizando emprendimiento:", error);

        if (error.code === "23503") {
            return res.status(400).json({ error: "Categoría no válida" });
        }

        if (error.code === "23505") {
            return res
                .status(400)
                .json({ error: "Ya existe un emprendimiento con ese nombre" });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
};
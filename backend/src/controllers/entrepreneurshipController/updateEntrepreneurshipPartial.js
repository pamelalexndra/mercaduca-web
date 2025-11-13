import pool from "../../database/db.js";

export const updateEntrepreneurshipPartial = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID de emprendimiento inválido" });
        }

        if (Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json({ error: "No se proporcionaron campos para actualizar" });
        }

        // Construir query dinámicamente
        const allowedFields = [
            "nombre",
            "descripcion",
            "imagen_url",
            "instagram",
            "disponible",
            "id_categoria",
        ];
        const setParts = [];
        const params = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                let dbField = key;
                if (key === "imagen_url") dbField = "Imagen_URL";
                if (key === "id_categoria") dbField = "id_categoria";

                setParts.push(`${dbField} = $${paramCount}`);
                // Conversiones de tipo
                if (key === "id_categoria") {
                    params.push(value ? parseInt(value) : null);
                } else if (key === "disponible") {
                    params.push(Boolean(value));
                } else {
                    params.push(value?.toString().trim() || "");
                }

                paramCount++;
            }
        }

        if (setParts.length === 0) {
            return res
                .status(400)
                .json({ error: "No hay campos válidos para actualizar" });
        }

        params.push(parseInt(id));

        const result = await pool.query(
            `
        UPDATE Emprendimiento 
        SET ${setParts.join(", ")}
        WHERE id_emprendimiento = $${paramCount}
        RETURNING *
        `,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Emprendimiento no encontrado" });
        }

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
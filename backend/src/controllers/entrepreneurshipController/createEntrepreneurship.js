import pool from "../../database/db.js";

export const createEntrepreneurship = async (req, res) => {
    try {
        const { nombre, descripcion, imagen_url, instagram, id_categoria } =
            req.body;

        // Validaciones básicas
        if (!nombre) {
            return res.status(400).json({
                error: "El campo nombre es requerido",
            });
        }

        // Insertar emprendimiento
        const result = await pool.query(
            `
        INSERT INTO Emprendimiento (
            id_categoria, 
            Nombre, 
            Descripcion, 
            Imagen_URL, 
            Instagram,
            Disponible
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
            [
                id_categoria ? parseInt(id_categoria) : null,
                nombre.trim(),
                descripcion?.trim() || "",
                imagen_url?.trim() || "",
                instagram?.trim() || "",
                true, // Por defecto, disponible al crear
            ]
        );

        res.status(201).json({
            message: "Emprendimiento creado exitosamente",
            emprendimiento: result.rows[0],
        });
    } catch (error) {
        console.error("Error creando emprendimiento:", error);

        if (error.code === "23503") {
            // Foreign key violation
            return res.status(400).json({ error: "Categoría no válida" });
        }

        if (error.code === "23505") {
            // Unique violation
            return res
                .status(400)
                .json({ error: "Ya existe un emprendimiento con ese nombre" });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
};
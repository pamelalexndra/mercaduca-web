import pool from "../../database/connection.js";

export const deleteProfile = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Obtener el id_emprendedor del usuario
        const userResult = await client.query(
            `
        SELECT id_emprendedor 
        FROM Usuarios 
        WHERE id_usuario = $1
      `,
            [req.params.userId]
        );

        const idEmprendedor = userResult.rows[0]?.id_emprendedor;

        if (idEmprendedor) {
            // Obtener los emprendimientos del emprendedor
            const emprendimientosResult = await client.query(
                `
          SELECT id_emprendimiento 
          FROM Emprendedor 
          WHERE id_emprendedor = $1
        `,
                [idEmprendedor]
            );

            const emprendimientosIds = emprendimientosResult.rows.map(
                (row) => row.id_emprendimiento
            );

            if (emprendimientosIds.length > 0) {
                // Desactivar productos de los emprendimientos
                await client.query(
                    `
            UPDATE Producto 
            SET disponible = false 
            WHERE id_emprendimiento = ANY($1)
          `,
                    [emprendimientosIds]
                );

                // Desactivar emprendimientos
                await client.query(
                    `
            UPDATE Emprendimiento 
            SET disponible = false 
            WHERE id_emprendimiento = ANY($1)
          `,
                    [emprendimientosIds]
                );
            }

            // Desactivar emprendedor
            await client.query(
                `
          UPDATE Emprendedor 
          SET activo = false 
          WHERE id_emprendedor = $1
        `,
                [idEmprendedor]
            );
        }

        await client.query("COMMIT");
        res.json({ success: true, message: "Perfil desactivado exitosamente" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error desactivando perfil:", error);
        res.status(500).json({ error: "Error desactivando perfil" });
    } finally {
        client.release();
    }
};
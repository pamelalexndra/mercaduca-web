import pool from "../../database/db.js";

export const updateProfile = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { nombres, apellidos, correo, telefono, username, nuevaContraseña } =
            req.body;

        // Verificar si se intenta cambiar la contraseña
        if (nuevaContraseña) {
            // Obtener fecha del último cambio de contraseña
            const userResult = await client.query(
                `
          SELECT Registro_contraseña 
          FROM Usuarios 
          WHERE id_usuario = $1
        `,
                [req.params.userId]
            );

            const ultimoCambioContraseña = userResult.rows[0]?.registro_contraseña;

            if (ultimoCambioContraseña) {
                const ahora = new Date();
                const fechaUltimoCambio = new Date(ultimoCambioContraseña);

                // Calcular diferencia en meses
                const diffMeses =
                    (ahora.getFullYear() - fechaUltimoCambio.getFullYear()) * 12 +
                    (ahora.getMonth() - fechaUltimoCambio.getMonth());

                // Solo permitir cambiar contraseña si ha pasado al menos 1 mes desde el último cambio
                if (diffMeses < 1) {
                    await client.query("ROLLBACK");
                    return res.status(400).json({
                        success: false,
                        error: "Solo puedes cambiar la contraseña una vez cada 30 días",
                    });
                }
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

            // Actualizar usuario con nueva contraseña y fecha de registro
            await client.query(
                `
          UPDATE Usuarios 
          SET Usuario = $1, 
              Contraseña = $2,
              Registro_contraseña = CURRENT_TIMESTAMP
          WHERE id_usuario = $3
        `,
                [username, hashedPassword, req.params.userId]
            );
        } else {
            // Actualizar username
            await client.query(
                `
          UPDATE Usuarios 
          SET Usuario = $1 
          WHERE id_usuario = $2
        `,
                [username, req.params.userId]
            );
        }

        // Actualizar emprendedor
        await client.query(
            `
        UPDATE Emprendedor 
        SET Nombres = $1, Apellidos = $2, 
            Correo = $3, Telefono = $4
        WHERE id_emprendedor IN (
          SELECT id_emprendedor 
          FROM Usuarios 
          WHERE id_usuario = $5
        )
      `,
            [nombres, apellidos, correo, telefono, req.params.userId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: nuevaContraseña
                ? "Perfil y contraseña actualizados exitosamente"
                : "Perfil actualizado exitosamente",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error actualizando perfil:", error);
        res.status(500).json({
            success: false,
            error: "Error actualizando perfil",
        });
    } finally {
        client.release();
    }
};
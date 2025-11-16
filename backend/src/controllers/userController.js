import pool from "../database/db.js";
import bcrypt from "bcrypt";

export const create = async (userData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 2. Crear emprendedor primero
    const emprendedorResult = await client.query(
      `
      INSERT INTO Emprendedor (Nombres, Apellidos, Correo, Telefono)
      VALUES ($1, $2, $3, $4)
      RETURNING id_emprendedor
    `,
      [userData.nombres, userData.apellidos, userData.correo, userData.telefono]
    );

    const idEmprendedor = emprendedorResult.rows[0].id_emprendedor;

    // 3. Crear usuario
    const userResult = await client.query(
      `
      INSERT INTO Usuarios (Usuario, Contraseña, id_emprendedor)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, Usuario
    `,
      [userData.username, hashedPassword, idEmprendedor]
    );

    await client.query("COMMIT");
    return userResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findByUsername = async (username) => {
  try {
    const result = await pool.query(
      `
      SELECT id_usuario, Usuario as username, Contraseña AS password, Registro_usuario 
      FROM Usuarios 
      WHERE Usuario = $1
    `,
      [username]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error en findByUsername:", error);
    throw error;
  }
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          u.id_usuario,
          u.Usuario AS username, 
          ed.id_emprendedor, 
          ed.Nombres AS emprendedor_nombres, 
          ed.Apellidos AS emprendedor_apellidos, 
          ed.Correo AS correo, 
          ed.Telefono AS telefono,
          ed.id_emprendimiento,
          em.id_emprendimiento,
          em.Nombre AS emprendimiento_nombre
          em.Descripcion AS emprendimiento_descripcion
          em.Imagen_url AS emprendimiento_imagen_url
          em.Instagram AS emprendimiento_instagram
          em.Disponible AS emprendimiento_disponible
          em.id_categoria AS emprendimiento_id_categoria
        FROM Usuarios u
        INNER JOIN Emprendedor ed ON u.id_emprendedor = ed.id_emprendedor
        LEFT JOIN Emprendimiento em ON ed.id_emprendimiento = em.id_emprendimiento
        WHERE u.id_usuario = $1
      `,
      [req.params.userId]
    );

    const [row] = result.rows;

    if (!row) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    const profile = {
      id_usuario: row.id_usuario,
      username: row.username,
      id_emprendedor: row.id_emprendedor,
      nombres: row.nombres,
      apellidos: row.apellidos,
      correo: row.correo,
      telefono: row.telefono,
      emprendimiento: row.id_emprendimiento
        ? {
          id_emprendimiento: row.id_emprendimiento,
          nombre: row.emprendimiento_nombre,
          descripcion: row.emprendimiento_descripcion,
          imagen_url: row.emprendimiento_imagen,
          instagram: row.emprendimiento_instagram,
          disponible: row.emprendimiento_disponible,
          id_categoria: row.emprendimiento_categoria,
        }
        : null,
    };

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};

export const updateUserProfile = async (req, res) => {
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

export const deleteUserProfile = async (req, res) => {
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
            UPDATE Productos 
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

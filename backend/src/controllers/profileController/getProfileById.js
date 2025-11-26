import pool from "../../database/connection.js";

export const getProfileById = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          u.id_usuario,
          u.Usuario AS username,
          ed.Nombres,
          ed.Apellidos,
          ed.Correo,
          ed.Telefono,
          ed.id_emprendimiento,
          e.Nombre AS emprendimiento_nombre,
          e.Descripcion AS emprendimiento_descripcion,
          e.Imagen_URL AS emprendimiento_imagen_url,
          e.Instagram AS emprendimiento_instagram,
          e.id_categoria AS emprendimiento_id_categoria
        FROM Usuarios u
        INNER JOIN Emprendedor ed ON u.id_emprendedor = ed.id_emprendedor
        LEFT JOIN Emprendimiento e ON ed.id_emprendimiento = e.id_emprendimiento
        WHERE u.id_usuario = $1
      `,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const profileRow = result.rows[0];

    const profile = {
      id_usuario: profileRow.id_usuario,
      username: profileRow.username,
      nombres: profileRow.nombres,
      apellidos: profileRow.apellidos,
      correo: profileRow.correo,
      telefono: profileRow.telefono,
    };

    if (profileRow.id_emprendimiento) {
      profile.emprendimiento = {
        id_emprendimiento: profileRow.id_emprendimiento,
        nombre: profileRow.emprendimiento_nombre,
        descripcion: profileRow.emprendimiento_descripcion,
        imagen_url: profileRow.emprendimiento_imagen_url,
        instagram: profileRow.emprendimiento_instagram,
        id_categoria: profileRow.emprendimiento_id_categoria,
      };
    }

    res.json({ profile });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
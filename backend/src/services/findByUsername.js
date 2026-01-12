// backend/src/utils/db/findByUsername.js
import pool from "../database/connection.js";

export const findByUsername = async (username) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id_usuario, 
        u.usuario, 
        u.contraseña, 
        u.registro_usuario,
        e.activo,
        u.rol
      FROM Usuarios u
      JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
      WHERE u.Usuario = $1
    `,
      [username]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

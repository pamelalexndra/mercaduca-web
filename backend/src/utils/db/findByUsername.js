import pool from "../../database/db.js";

export const findByUsername = async (username) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id_usuario, 
        u.Usuario, 
        u.Contraseña, 
        u.Registro_usuario,
        e.Activo  
      FROM Usuarios u
      JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
      WHERE u.Usuario = $1
    `,
      [username]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error en findByUsername:", error);
    throw error;
  }
};
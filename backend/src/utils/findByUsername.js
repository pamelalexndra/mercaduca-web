import pool from "../database/db.js";
export const findByUsername = async (username) => {
  try {
    const result = await pool.query(
      `
      SELECT id_usuario, Usuario, Contraseña, Registro_usuario 
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
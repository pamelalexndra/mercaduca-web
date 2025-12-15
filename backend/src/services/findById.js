import pool from "../database/connection.js";

export const findById = async (id) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id_usuario,
        Usuario,
        Rol
      FROM Usuarios
      WHERE id_usuario = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error en findById -> ", error);
    throw error;
  }
}
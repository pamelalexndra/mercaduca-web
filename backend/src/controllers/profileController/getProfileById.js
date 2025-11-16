import pool from "../../database/db.js";
export const getProfileById = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT u.id_usuario, u.Usuario, ed.Nombres, ed.Apellidos, ed.Correo, ed.Telefono
        FROM Usuarios u
        INNER JOIN Emprendedor ed ON u.id_emprendedor = ed.id_emprendedor
        WHERE u.id_usuario = $1
      `,
      [req.params.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};
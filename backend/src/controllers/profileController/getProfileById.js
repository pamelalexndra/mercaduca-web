import pool from "../../database/connection.js";

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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

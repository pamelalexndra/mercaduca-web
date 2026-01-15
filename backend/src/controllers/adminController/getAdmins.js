// src/controllers/adminController/getAdminsController.js
import pool from "../../database/connection.js";

export const getAdmins = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_usuario,
        u.usuario,
        u.rol,
        e.id_emprendedor,
        e.nombres,
        e.apellidos,
        e.correo,
        e.telefono
      FROM Usuarios as u
      INNER JOIN Emprendedor as e ON u.id_emprendedor = e.id_emprendedor
      WHERE u.rol IN ('Administrador')
      ORDER BY e.nombres
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener administradores",
    });
  }
};

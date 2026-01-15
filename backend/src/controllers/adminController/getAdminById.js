// src/controllers/adminController/getAdminByIdController.js
import pool from "../../database/connection.js";

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }

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
      WHERE u.id_usuario = $1 
        AND u.rol IN ('Administrador')
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener administrador",
    });
  }
};

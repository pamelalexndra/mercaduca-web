import pool from "../../database/connection.js";

export const getRequest = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_solicitud,
        nombres,
        apellidos,
        correo,
        telefono,
        usuario,
        descripcion_solicitud
      FROM solicitudes 
      ORDER BY id_solicitud ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener solicitudes",
    });
  }
};

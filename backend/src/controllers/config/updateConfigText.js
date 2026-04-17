import pool from "../../database/connection.js";
import cache from "../../services/cache.service.js";

export const updateConfigText = async (req, res) => {
  const { clave, valor } = req.body;

  try {
    await pool.query(
      `INSERT INTO sitio_configuracion (clave, valor)
       VALUES ($1, $2)
       ON CONFLICT (clave)
       DO UPDATE SET valor = EXCLUDED.valor`,
      [clave, valor],
    );

    cache.set(clave, valor);

    res.json({ message: "Configuración guardada", valor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};
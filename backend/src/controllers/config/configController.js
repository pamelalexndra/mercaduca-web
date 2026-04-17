import pool from "../../database/connection.js";
import { uploadImage } from "../../services/cloudinary.service.js";
import cache from "../../services/cache.service.js";

export const getConfigByKey = async (req, res) => {
  try {
    const { clave } = req.params;

    // Revisar cache
    const cachedValue = cache.get(clave);
    if (cachedValue) {
      return res.json({ valor: cachedValue, source: "cache" });
    }

    // Consultar base de datos
    const { rows } = await pool.query(
      "SELECT valor FROM sitio_configuracion WHERE clave = $1",
      [clave],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "No encontrado" });

    const valor = rows[0].valor;

    // Guardar en cache
    cache.set(clave, valor);

    res.json({ valor, source: "database" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { clave } = req.body;

    if (!clave)
      return res.status(400).json({ message: "Falta el campo 'clave'" });

    if (!req.file)
      return res.status(400).json({ message: "No se subió ninguna imagen" });

    const { secure_url } = await uploadImage(req.file.buffer);

    await pool.query(
      `INSERT INTO sitio_configuracion (clave, valor)
       VALUES ($1, $2)
       ON CONFLICT (clave)
       DO UPDATE SET valor = EXCLUDED.valor`,
      [clave, secure_url],
    );

    cache.set(clave, secure_url);

    res.json({ message: "Configuración actualizada", newUrl: secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
import pool from "../../database/connection.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio_dolares,
      id_categoria,
      id_emprendimiento,
    } = req.body;

    if (!id_emprendimiento || isNaN(id_emprendimiento)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (!nombre || !precio_dolares || !id_categoria) {
      return res.status(400).json({
        error: "Campos requeridos: nombre, precio_dolares, id_categoria",
      });
    }

    let imagen_url = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "productos");
      imagen_url = result.secure_url;
    } else {
      return res.status(400).json({ error: "La imagen es obligatoria" });
    }

    const emprendimientoCheck = await pool.query(
      "SELECT id_emprendimiento FROM Emprendimiento WHERE id_emprendimiento = $1",
      [parseInt(id_emprendimiento)],
    );

    if (emprendimientoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    const result = await pool.query(
      `
      INSERT INTO Producto (
        id_emprendimiento, 
        id_categoria, 
        Nombre, 
        Descripcion, 
        Imagen_URL, 
        Precio_dolares
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        parseInt(id_emprendimiento),
        parseInt(id_categoria),
        nombre.trim(),
        descripcion?.trim() || "",
        imagen_url,
        parseFloat(precio_dolares),
      ],
    );

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando producto:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
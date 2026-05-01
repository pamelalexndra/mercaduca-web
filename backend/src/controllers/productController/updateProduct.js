import pool from "../../database/connection.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Los datos vienen de FormData, no de JSON
    const { nombre, descripcion, precio_dolares, id_categoria } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    // Validar que los campos requeridos existan
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    if (!precio_dolares) {
      return res.status(400).json({ error: "El precio es requerido" });
    }

    if (!id_categoria) {
      return res.status(400).json({ error: "La categoría es requerida" });
    }

    const productoCheck = await pool.query(
      "SELECT id_producto, Imagen_URL FROM Producto WHERE id_producto = $1",
      [parseInt(id)],
    );

    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let imagen_url = productoCheck.rows[0].imagen_url;

    // Si hay nueva imagen, subirla a Cloudinary
    if (req.file) {
      if (imagen_url) {
        try {
          await deleteImageByUrl(imagen_url);
        } catch (error) {
          // No fallamos la actualización
        }
      }
      const result = await uploadToCloudinary(req.file.buffer, "productos");
      imagen_url = result.secure_url;
    }

    // Convertir los valores correctamente
    const nombreTrimmed = nombre.trim();
    const descripcionTrimmed = descripcion ? descripcion.trim() : "";
    const precioNum = parseFloat(precio_dolares);
    const idCategoriaNum = parseInt(id_categoria);

    const result = await pool.query(
      `UPDATE Producto 
       SET 
         Nombre = $1,
         Descripcion = $2,
         Imagen_URL = $3,
         Precio_dolares = $4,
         id_categoria = $5
       WHERE id_producto = $6
       RETURNING *`,
      [
        nombreTrimmed,
        descripcionTrimmed,
        imagen_url,
        precioNum,
        idCategoriaNum,
        parseInt(id),
      ],
    );

    res.json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
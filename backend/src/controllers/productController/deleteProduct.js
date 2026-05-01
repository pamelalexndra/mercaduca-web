import pool from "../../database/connection.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const deleteProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const idProducto = parseInt(id);

    const imageResult = await client.query(
      "SELECT Imagen_URL FROM Producto WHERE id_producto = $1",
      [idProducto],
    );

    const imagenUrl = imageResult.rows[0]?.imagen_url;

    await client.query("BEGIN");

    const result = await client.query(
      `
      DELETE FROM Producto 
      WHERE id_producto = $1
      RETURNING id_producto, Nombre, Imagen_URL
      `,
      [idProducto],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await client.query("COMMIT");

    if (imagenUrl) {
      try {
        await deleteImageByUrl(imagenUrl);
      } catch (cloudinaryError) {
        // No fallamos la eliminación
      }
    }

    res.json({
      message: "Producto eliminado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
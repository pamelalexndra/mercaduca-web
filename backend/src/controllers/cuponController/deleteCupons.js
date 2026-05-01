import pool from "../../database/connection.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const deleteCupons = async (req, res) => {
  try {
    const { id } = req.params;

    const cuponResult = await pool.query(
      "SELECT imagen_url FROM Cupon WHERE id_cupon = $1",
      [id],
    );

    if (cuponResult.rows.length === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    const imagenUrl = cuponResult.rows[0].imagen_url;

    const { rowCount } = await pool.query(
      "DELETE FROM Cupon WHERE id_cupon = $1",
      [id],
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    let cloudinaryResult = null;
    if (imagenUrl) {
      try {
        cloudinaryResult = await deleteImageByUrl(imagenUrl);
      } catch (cloudinaryError) {
        // No fallamos la eliminación del cupón si hay error en Cloudinary
      }
    }

    res.json({
      message: "Cupón eliminado correctamente",
      cuponId: id,
      imagenEliminada: cloudinaryResult?.success || false,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
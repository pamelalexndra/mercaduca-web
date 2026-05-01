import pool from "../../database/connection.js";
import { deleteImageByUrl } from "../../utils/helpers/deleteFromCloudinary.js";

export const deleteEntrepreneurship = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    const idEmprendimiento = parseInt(id);

    const imageResult = await client.query(
      "SELECT Imagen_URL FROM Emprendimiento WHERE id_emprendimiento = $1",
      [idEmprendimiento],
    );

    const imagenUrl = imageResult.rows[0]?.imagen_url;

    await client.query("BEGIN");

    const emprendedoresActualizados = await client.query(
      `UPDATE Emprendedor 
       SET id_emprendimiento = NULL 
       WHERE id_emprendimiento = $1
       RETURNING id_emprendedor, nombres, apellidos`,
      [idEmprendimiento],
    );

    const resultEmprendimiento = await client.query(
      `DELETE FROM Emprendimiento WHERE id_emprendimiento = $1 RETURNING id_emprendimiento, Nombre, Imagen_URL`,
      [idEmprendimiento],
    );

    await client.query("COMMIT");

    if (imagenUrl) {
      try {
        await deleteImageByUrl(imagenUrl);
      } catch (cloudinaryError) {
        // No fallamos la eliminación
      }
    }

    res.json({
      message: "Emprendimiento eliminado exitosamente",
      emprendimiento: resultEmprendimiento.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando emprendimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
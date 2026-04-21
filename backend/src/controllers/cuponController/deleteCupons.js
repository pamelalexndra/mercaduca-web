import pool from "../../database/connection.js";

export const deleteCupons = async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await pool.query(
      "DELETE FROM Cupon WHERE id_cupon = $1",
      [id],
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    res.json({ message: "Cupón eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
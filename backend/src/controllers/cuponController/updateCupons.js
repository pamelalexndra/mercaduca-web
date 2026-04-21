import pool from "../../database/connection.js";
import { validarAlcance } from "../../utils/helpers/validarAlcance.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";

export const updateCupons = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT * FROM Cupon WHERE id_cupon = $1",
      [id],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    const current = existing.rows[0];
    let {
      id_emprendimiento,
      id_categoria,
      id_producto,
      nombre,
      descripcion,
      descuento,
      disponible,
      fecha_limite,
    } = req.body;

    // Determinar qué valores usar (los nuevos o los existentes)
    const nuevo_id_emprendimiento =
      id_emprendimiento !== undefined
        ? id_emprendimiento
        : current.id_emprendimiento;
    const nuevo_id_categoria =
      id_categoria !== undefined ? id_categoria : current.id_categoria;
    const nuevo_id_producto =
      id_producto !== undefined ? id_producto : current.id_producto;

    // Validar alcance (solo una opción debe estar presente)
    const alcanceError = validarAlcance(
      nuevo_id_emprendimiento,
      nuevo_id_categoria,
      nuevo_id_producto,
    );
    if (alcanceError) return res.status(400).json({ message: alcanceError });

    // Procesar imagen si se subió un archivo nuevo
    let imagen_url = current.imagen_url;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imagen_url = result.secure_url;
    } else if (req.body.imagen_url !== undefined) {
      imagen_url = req.body.imagen_url;
    }

    // Normalizar según el alcance seleccionado
    let final_id_emprendimiento = nuevo_id_emprendimiento;
    let final_id_categoria = nuevo_id_categoria;
    let final_id_producto = nuevo_id_producto;

    if (nuevo_id_emprendimiento) {
      final_id_categoria = null;
      final_id_producto = null;
    } else if (nuevo_id_categoria) {
      final_id_emprendimiento = null;
      final_id_producto = null;
    } else if (nuevo_id_producto) {
      final_id_emprendimiento = null;
      final_id_categoria = null;
    }

    const { rows } = await pool.query(
      `UPDATE Cupon SET
        id_emprendimiento = $1,
        id_categoria      = $2,
        id_producto       = $3,
        nombre            = COALESCE($4, nombre),
        descripcion       = COALESCE($5, descripcion),
        imagen_url        = $6,
        descuento         = COALESCE($7, descuento),
        disponible        = COALESCE($8, disponible),
        fecha_limite      = COALESCE($9, fecha_limite)
       WHERE id_cupon = $10
       RETURNING *`,
      [
        final_id_emprendimiento,
        final_id_categoria,
        final_id_producto,
        nombre || null,
        descripcion || null,
        imagen_url,
        descuento !== undefined ? descuento : null,
        disponible !== undefined ? disponible : null,
        fecha_limite || null,
        id,
      ],
    );

    res.json({ message: "Cupón actualizado", cupon: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "Ya existe un cupón para ese producto. Solo se permite uno por producto.",
      });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
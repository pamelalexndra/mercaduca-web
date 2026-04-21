import pool from "../../database/connection.js";
import { validarAlcance } from "../../utils/helpers/validarAlcance.js";
import { uploadToCloudinary } from "../../utils/helpers/uploadToCloudinary.js";

export const createCupons = async (req, res) => {
  try {
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

    // Validar campos obligatorios
    if (!id_emprendimiento && !id_categoria && !id_producto) {
      return res.status(400).json({
        message:
          "Debe seleccionar al menos un emprendimiento, categoría o producto para el cupón.",
      });
    }
    if (!nombre || descuento === undefined || descuento === null) {
      return res
        .status(400)
        .json({ message: "Nombre y descuento son obligatorios." });
    }
    if (!descripcion) {
      return res
        .status(400)
        .json({ message: "La descripción es obligatoria." });
    }
    if (!fecha_limite) {
      return res
        .status(400)
        .json({ message: "La fecha límite es obligatoria." });
    }

    // Validar alcance (solo una opción debe estar presente)
    const alcanceError = validarAlcance(
      id_emprendimiento,
      id_categoria,
      id_producto,
    );
    if (alcanceError) return res.status(400).json({ message: alcanceError });

    // Procesar imagen si se subió un archivo
    let imagen_url = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imagen_url = result.secure_url;
    } else if (req.body.imagen_url) {
      imagen_url = req.body.imagen_url;
    } else {
      return res.status(400).json({ message: "La imagen es obligatoria." });
    }

    // Si se seleccionó emprendimiento -> categoría y producto a null
    if (id_emprendimiento) {
      id_categoria = null;
      id_producto = null;
    }
    // Si se seleccionó categoría -> emprendimiento y producto a null
    else if (id_categoria) {
      id_emprendimiento = null;
      id_producto = null;
    }
    // Si se seleccionó producto -> emprendimiento y categoría a null
    else if (id_producto) {
      id_emprendimiento = null;
      id_categoria = null;
    }

    const { rows } = await pool.query(
      `INSERT INTO Cupon
        (id_emprendimiento, id_categoria, id_producto, nombre, descripcion,
         imagen_url, descuento, disponible, fecha_limite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id_emprendimiento || null,
        id_categoria || null,
        id_producto || null,
        nombre,
        descripcion,
        imagen_url,
        descuento,
        disponible !== undefined ? disponible : true,
        fecha_limite,
      ],
    );

    res.status(201).json({ message: "Cupón creado", cupon: rows[0] });
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
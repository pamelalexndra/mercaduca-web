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
      imagen_url,
    } = req.body;

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

    const alcanceError = validarAlcance(
      id_emprendimiento,
      id_categoria,
      id_producto,
    );
    if (alcanceError) return res.status(400).json({ message: alcanceError });

    let imagen_final_url = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "cupones");
      imagen_final_url = result.secure_url;
    } else if (imagen_url) {
      imagen_final_url = imagen_url;
    } else {
      return res.status(400).json({ message: "La imagen es obligatoria." });
    }

    if (id_emprendimiento) {
      id_categoria = null;
      id_producto = null;
    } else if (id_categoria) {
      id_emprendimiento = null;
      id_producto = null;
    } else if (id_producto) {
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
        imagen_final_url,
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
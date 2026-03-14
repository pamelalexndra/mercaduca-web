// src/controllers/cuponController.js
import pool from "../database/connection.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mercaduca_cupones" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * Valida que el alcance sea coherente:
 * - Producto específico: id_producto presente, id_categoria e id_emprendimiento nulos
 * - Categoría completa: id_categoria presente, id_emprendimiento e id_producto nulos
 * - Emprendimiento completo: id_emprendimiento presente, id_categoria e id_producto nulos
 */
const validarAlcance = (id_emprendimiento, id_categoria, id_producto) => {
  // Contar cuántos IDs están presentes
  const idsPresentes = [
    id_emprendimiento ? 1 : 0,
    id_categoria ? 1 : 0,
    id_producto ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (idsPresentes === 0) {
    return "Debe seleccionar al menos un emprendimiento, categoría o producto para el cupón.";
  }

  if (idsPresentes > 1) {
    return "El cupón solo puede aplicarse a una opción: emprendimiento completo, categoría específica o producto específico.";
  }

  return null;
};

// ─── GET /cupones ─── Público
export const getCupones = async (req, res) => {
  try {
    const { id_emprendimiento, id_categoria, id_producto, solo_disponibles } =
      req.query;

    let query = `
      SELECT
        c.*,
        e.Nombre       AS emprendimiento_nombre,
        cat.Categoria  AS categoria_nombre,
        p.Nombre       AS producto_nombre,
        CASE
          WHEN c.id_producto  IS NOT NULL THEN 'producto'
          WHEN c.id_categoria IS NOT NULL THEN 'categoria'
          ELSE 'emprendimiento'
        END AS alcance
      FROM Cupon c
      LEFT JOIN Emprendimiento e  ON c.id_emprendimiento = e.id_emprendimiento
      LEFT JOIN Categorias    cat ON c.id_categoria      = cat.id_categoria
      LEFT JOIN Producto      p  ON c.id_producto       = p.id_producto
      WHERE 1=1
    `;
    const params = [];

    if (id_emprendimiento) {
      params.push(id_emprendimiento);
      query += ` AND c.id_emprendimiento = $${params.length}`;
    }
    if (id_categoria) {
      params.push(id_categoria);
      query += ` AND c.id_categoria = $${params.length}`;
    }
    if (id_producto) {
      params.push(id_producto);
      query += ` AND c.id_producto = $${params.length}`;
    }
    if (solo_disponibles === "true") {
      query += ` AND c.Disponible = TRUE`;
      query += ` AND (c.Fecha_limite IS NULL OR c.Fecha_limite > NOW())`;
    }

    query += ` ORDER BY c.Fecha_creacion DESC`;

    const { rows } = await pool.query(query, params);
    res.json({ cupones: rows });
  } catch (error) {
    console.error("Error obteniendo cupones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── GET /cupones/:id ─── Público
export const getCuponById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
        c.*,
        e.Nombre       AS emprendimiento_nombre,
        cat.Categoria  AS categoria_nombre,
        p.Nombre       AS producto_nombre,
        CASE
          WHEN c.id_producto  IS NOT NULL THEN 'producto'
          WHEN c.id_categoria IS NOT NULL THEN 'categoria'
          ELSE 'emprendimiento'
        END AS alcance
       FROM Cupon c
       LEFT JOIN Emprendimiento e  ON c.id_emprendimiento = e.id_emprendimiento
       LEFT JOIN Categorias    cat ON c.id_categoria      = cat.id_categoria
       LEFT JOIN Producto      p  ON c.id_producto       = p.id_producto
       WHERE c.id_cupon = $1`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    res.json({ cupon: rows[0] });
  } catch (error) {
    console.error("Error obteniendo cupón:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── POST /cupones ─── Solo admin
export const createCupon = async (req, res) => {
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
    console.error("Error creando cupón:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── PUT /cupones/:id ─── Solo admin
export const updateCupon = async (req, res) => {
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
    console.error("Error actualizando cupón:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── DELETE /cupones/:id ─── Solo admin
export const deleteCupon = async (req, res) => {
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
    console.error("Error eliminando cupón:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

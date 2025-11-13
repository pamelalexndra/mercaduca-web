import pool from "../../database/db.js";

export const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      imagen_url,
      precio_dolares,
      existencias,
      id_categoria,
      id_emprendimiento, // id_emprendimiento viene del body en lugar de params, mas seguro
    } = req.body;

    // Validaciones básicas
    if (!id_emprendimiento || isNaN(id_emprendimiento)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (!nombre || !precio_dolares || !id_categoria) {
      return res.status(400).json({
        error: "Campos requeridos: nombre, precio_dolares, id_categoria",
      });
    }

    // Verificar que el emprendimiento existe
    const emprendimientoCheck = await pool.query(
      "SELECT id_emprendimiento FROM Emprendimiento WHERE id_emprendimiento = $1",
      [parseInt(id_emprendimiento)]
    );

    if (emprendimientoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    // Insertar producto
    const result = await pool.query(
      `
      INSERT INTO Producto (
        id_emprendimiento, 
        id_categoria, 
        Nombre, 
        Descripcion, 
        Imagen_URL, 
        Precio_dolares, 
        Existencias,
        Disponible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        parseInt(id_emprendimiento),
        parseInt(id_categoria),
        nombre.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        parseFloat(precio_dolares),
        parseInt(existencias) || 0,
        (parseInt(existencias) || 0) > 0, // Disponible si tiene existencias
      ]
    );

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando producto:", error);

    if (error.code === "23503") {
      // Foreign key violation
      return res.status(400).json({ error: "Categoría no válida" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
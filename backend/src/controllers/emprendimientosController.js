import { parse } from "dotenv";
import pool from "../database/db.js";

export const getEmprendimientos = async (req, res) => {
  try {
    // Log de diagnóstico
    const dbCheck = await pool.query(
      "SELECT NOW() as time, COUNT(*) as total FROM emprendimiento WHERE disponible = true"
    );
    console.log(
      "Conexión BD:",
      dbCheck.rows[0].time,
      "Total emprendimientos:",
      dbCheck.rows[0].total
    );

    // Parámetros con valores por defecto
    const { ids, ordenar = "fecha_desc", limit } = req.query;

    const queryParts = [
      `SELECT
                e.id_emprendimiento AS id,
                e.Nombre AS nombre,
                e.Descripcion AS descripcion,
                e.Imagen_URL AS imagen,
                e.Instagram AS instagram,
                e.Fecha_registro,
                c.id_categoria AS categoria_id,
                c.Categoria AS categoria_nombre
            FROM Emprendimiento e
            JOIN Categorias c ON e.id_categoria = c.id_categoria
            WHERE e.Disponible = true`,
    ];

    const params = []; // Array para almacenar los parámetros de la consulta
    const filtros = {}; // Objeto para almacenar los filtros

    // Filtro por categorías
    if (ids) {
      const categoriasIds = ids
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => id > 0);
      if (categoriasIds.length > 0) {
        const placeholders = categoriasIds
          .map((_, i) => `$${params.length + i + 1}`)
          .join(",");
        queryParts.push(` AND e.id_categoria IN (${placeholders})`);
        params.push(...categoriasIds);
        filtros.categorias = categoriasIds;
      }
    }

    // Ordenamiento
    const ordenamientos = {
      fecha_desc: "e.Fecha_registro DESC",
      fecha_asc: "e.Fecha_registro ASC",
      nombre_asc: "e.Nombre ASC",
      nombre_desc: "e.Nombre DESC",
    };

    queryParts.push(
      `ORDER BY ${ordenamientos[ordenar] || ordenamientos.fecha_desc}`
    );
    filtros.ordenamiento = ordenar;

    if (limit && !isNaN(limit)) {
      queryParts.push(`LIMIT $${params.length + 1}`);
      params.push(parseInt(limit));
    }

    // Ejecutar consulta
    const query = queryParts.join(" ");
    const result = await pool.query(query, params);

    res.json({
      emprendimientos: result.rows,
      total: result.rows.length,
      filtros: Object.keys(filtros).length ? filtros : "ninguno",
    });
  } catch (error) {
    console.error("Error obteniendo emprendimientos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getEmprendimientoById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de emprendimiento inválido" });
  }

  try {
    const query = `
      SELECT 
        e.id_emprendimiento,
        e.nombre, 
        e.descripcion,
        e.Imagen_URL as imagen_url,
        e.instagram,
        em.correo,
        em.telefono
      FROM emprendimiento e
      LEFT JOIN emprendedor em
        ON e.id_emprendimiento = em.id_emprendimiento
      WHERE e.id_emprendimiento = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener el emprendimiento:", error);
    res.status(500).json({
      error: "Error al obtener emprendimiento",
      details: error.message,
    });
  }
};

export const createEmprendimiento = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      nombre,
      descripcion,
      id_categoria,
      imagen_url,
      id_usuario,
      instagram,
    } = req.body;

    // VALIDACIÓN Y CONVERSIÓN DE TIPOS
    const userId = parseInt(id_usuario);
    const categoriaId = parseInt(id_categoria);

    if (isNaN(userId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    if (isNaN(categoriaId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "ID de categoría inválido" });
    }

    // 1. Crear el emprendimiento
    const emprendimientoResult = await client.query(
      `
      INSERT INTO Emprendimiento (Nombre, Descripcion, id_categoria, Imagen_URL, Instagram)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_emprendimiento
    `,
      [nombre, descripcion, categoriaId, imagen_url, instagram || ""]
    );

    const idEmprendimiento = emprendimientoResult.rows[0].id_emprendimiento;

    // 2. Verificar que el usuario existe y tiene un emprendedor asociado
    const usuarioResult = await client.query(
      `
      SELECT id_emprendedor 
      FROM Usuarios 
      WHERE id_usuario = $1
    `,
      [userId]
    );

    if (!usuarioResult.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idEmprendedor = usuarioResult.rows[0].id_emprendedor;

    if (!idEmprendedor) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "El usuario no tiene un emprendedor asociado" });
    }

    // 3. Actualizar el emprendedor con el id_emprendimiento
    await client.query(
      `
      UPDATE Emprendedor 
      SET id_emprendimiento = $1
      WHERE id_emprendedor = $2
    `,
      [idEmprendimiento, idEmprendedor]
    );

    await client.query("COMMIT");

    // Devolver los datos completos del emprendimiento
    const finalResult = await client.query(
      "SELECT * FROM Emprendimiento WHERE id_emprendimiento = $1",
      [idEmprendimiento]
    );

    res.json(finalResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando emprendimiento:", error);

    if (error.message.includes("invalid input syntax")) {
      return res.status(400).json({
        error:
          "Parámetros inválidos. Verifique que todos los IDs sean números válidos.",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Error creando emprendimiento",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

export const updateEmprendimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      imagen_url,
      instagram,
      disponible,
      id_categoria,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    // Verificar que el emprendimiento existe
    const emprendimientoCheck = await pool.query(
      "SELECT id_emprendimiento FROM Emprendimiento WHERE id_emprendimiento = $1",
      [parseInt(id)]
    );

    if (emprendimientoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    // Actualizar emprendimiento
    const result = await pool.query(
      `
            UPDATE Emprendimiento 
            SET 
            Nombre = $1,
            Descripcion = $2,
            Imagen_URL = $3,
            Instagram = $4,
            Disponible = $5,
            id_categoria = $6
            WHERE id_emprendimiento = $7
            RETURNING *
    `,
      [
        nombre?.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        instagram?.trim() || "",
        disponible !== undefined ? disponible : true,
        id_categoria ? parseInt(id_categoria) : null,
        parseInt(id),
      ]
    );

    res.json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando emprendimiento:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateEmprendimientoPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    // Construir query dinámicamente
    const allowedFields = [
      "nombre",
      "descripcion",
      "imagen_url",
      "instagram",
      "disponible",
      "id_categoria",
    ];
    const setParts = [];
    const params = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        let dbField = key;
        if (key === "imagen_url") dbField = "Imagen_URL";
        if (key === "id_categoria") dbField = "id_categoria";

        setParts.push(`${dbField} = $${paramCount}`);
        // Conversiones de tipo
        if (key === "id_categoria") {
          params.push(value ? parseInt(value) : null);
        } else if (key === "disponible") {
          params.push(Boolean(value));
        } else {
          params.push(value?.toString().trim() || "");
        }

        paramCount++;
      }
    }

    if (setParts.length === 0) {
      return res
        .status(400)
        .json({ error: "No hay campos válidos para actualizar" });
    }

    params.push(parseInt(id));

    const result = await pool.query(
      `
        UPDATE Emprendimiento 
        SET ${setParts.join(", ")}
        WHERE id_emprendimiento = $${paramCount}
        RETURNING *
        `,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando emprendimiento:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteEmprendimiento = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    // Verificar si el emprendimiento tiene productos activos
    const productosCheck = await pool.query(
      "SELECT COUNT(*) as count FROM Producto WHERE id_emprendimiento = $1 AND Disponible = true",
      [parseInt(id)]
    );

    if (parseInt(productosCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "No se puede eliminar el emprendimiento porque tiene productos activos. Elimine primero los productos.",
      });
    }

    // Borrado lógico
    const result = await pool.query(
      `
            UPDATE Emprendimiento 
            SET Disponible = false 
            WHERE id_emprendimiento = $1
            RETURNING id_emprendimiento, Nombre
        `,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json({
      message: "Emprendimiento eliminado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error eliminando emprendimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

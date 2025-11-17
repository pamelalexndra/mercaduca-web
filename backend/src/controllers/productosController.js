import pool from "../database/db.js";

export const getProductos = async (req, res) => {
  try {
    const test = await pool.query("SELECT NOW() as time");
    console.log("Conexión a BD exitosa:", test.rows[0].time);

    const simpleQuery = await pool.query(
      "SELECT COUNT(*) as count FROM producto"
    );
    console.log("Total productos:", simpleQuery.rows[0].count);

    // Obtenemos todos los parámetros de filtro
    const {
      ids,
      precio_min,
      precio_max,
      ordenar = "fecha_desc",
      emprendimiento_id,
      limit,
      search,
    } = req.query;

    let queryParts = [
      `SELECT
        p.id_producto AS id,
        p.Nombre AS nombre,
        p.Precio_dolares AS precio,
        c.Categoria AS categoria,
        p.Descripcion AS descripcion,
        p.Imagen_URL AS imagen,
        p.Existencias AS stock,
        p.id_categoria,
        e.Nombre AS nombre_emprendimiento,
        e.id_emprendimiento AS emprendimiento_id
      FROM Producto AS p
      JOIN Categorias AS c ON p.id_categoria = c.id_categoria
      JOIN Emprendimiento AS e ON p.id_emprendimiento = e.id_emprendimiento
      WHERE p.Disponible = true`,
    ];

    let params = []; // Array para almacenar los parámetros de la consulta
    let filtros = {}; // Objeto para almacenar los filtros

    // filtro por búsqueda de texto
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryParts.push(` AND (
        LOWER(p.Nombre) LIKE $${params.length + 1} 
        OR LOWER(p.Descripcion) LIKE $${params.length + 1}
        OR LOWER(e.Nombre) LIKE $${params.length + 1}
        OR LOWER(c.Categoria) LIKE $${params.length + 1}
      )`);
      params.push(searchTerm);
      filtros.search = search.trim();
    }

    // filtro por categorias
    if (ids) {
      const categoriasIds = ids
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => id > 0);
      if (categoriasIds.length > 0) {
        const placeholders = categoriasIds
          .map((_, i) => `$${params.length + i + 1}`)
          .join(",");
        queryParts.push(` AND p.id_categoria IN (${placeholders})`);
        params.push(...categoriasIds);
        filtros.categorias = categoriasIds;
      }
    }

    // Filtro por emprendimiento
    if (emprendimiento_id && !isNaN(emprendimiento_id)) {
      const emprendimientoId = parseInt(emprendimiento_id);
      queryParts.push(` AND p.id_emprendimiento = $${params.length + 1}`);
      params.push(emprendimientoId);
      filtros.emprendimiento_id = emprendimientoId;
    }

    // Filtros por precio
    const precioMin = parseFloat(precio_min);
    const precioMax = parseFloat(precio_max);

    if (!isNaN(precio_min)) {
      queryParts.push(` AND p.Precio_dolares >= $${params.length + 1}`);
      params.push(precioMin);
      filtros.precio_min = precioMin;
    }

    if (!isNaN(precio_max)) {
      queryParts.push(` AND p.Precio_dolares <= $${params.length + 1}`);
      params.push(precioMax);
      filtros.precio_max = precioMax;
    }

    // filtro por ordenamiento
    const ordenamientos = {
      precio_asc: "p.Precio_dolares ASC",
      precio_desc: "p.Precio_dolares DESC",
      fecha_desc: "p.Fecha_registro DESC",
      fecha_asc: "p.Fecha_registro ASC",
      nombre_asc: "e.Nombre ASC",
      nombre_desc: "e.Nombre DESC",
    };

    queryParts.push(
      ` ORDER BY ${ordenamientos[ordenar] || ordenamientos.fecha_desc}`
    );
    filtros.ordenamiento = ordenar;

    // Filtro por limit
    const limitValue = parseInt(limit);
    if (limitValue && !isNaN(limitValue)) {
      queryParts.push(` LIMIT $${params.length + 1}`);
      params.push(limitValue);
      filtros.limit = limitValue;
    }

    const query = queryParts.join(" ");
    const result = await pool.query(query, params);

    // Objeto raiz con array y metadata
    res.json({
      productos: result.rows,
      total: result.rows.length,
      filtros: Object.keys(filtros).length ? filtros : "ninguno",
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const result = await pool.query(
      `
      SELECT 
        p.id_producto AS id, 
        p.Nombre AS nombre,
        p.Descripcion AS descripcion,
        p.Imagen_URL AS imagen,
        p.Precio_dolares AS precio,
        p.Existencias AS stock,
        p.Disponible AS disponible,
        p.Fecha_registro,
        p.id_categoria,
        p.id_emprendimiento,
        c.Categoria AS categoria,
        e.Nombre as nombre_emprendimiento
      FROM Producto p
      JOIN Categorias c ON p.id_categoria = c.id_categoria
      JOIN Emprendimiento e ON p.id_emprendimiento = e.id_emprendimiento
      WHERE p.id_producto = $1
    `,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ producto: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createProducto = async (req, res) => {
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

export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      imagen_url,
      precio_dolares,
      existencias,
      disponible,
      id_categoria,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    // Verificar que el producto existe
    const productoCheck = await pool.query(
      "SELECT id_producto FROM Producto WHERE id_producto = $1",
      [parseInt(id)]
    );

    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Actualizar producto
    const result = await pool.query(
      `
            UPDATE Producto 
                SET 
                Nombre = $1,
                Descripcion = $2,
                Imagen_URL = $3,
                Precio_dolares = $4,
                Existencias = $5,
                Disponible = $6,
                id_categoria = $7
            WHERE id_producto = $8
            RETURNING *
            `,
      [
        nombre?.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        parseFloat(precio_dolares),
        parseInt(existencias) || 0,
        disponible !== undefined ? disponible : true,
        id_categoria ? parseInt(id_categoria) : null,
        parseInt(id),
      ]
    );

    res.json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateProductoPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
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
      "precio_dolares",
      "existencias",
      "disponible",
      "id_categoria",
    ];
    const setParts = [];
    const params = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        let dbField = key;
        if (key === "precio_dolares") dbField = "Precio_dolares";
        if (key === "imagen_url") dbField = "Imagen_URL";
        if (key === "id_categoria") dbField = "id_categoria";

        setParts.push(`${dbField} = $${paramCount}`);

        // Conversiones de tipo
        if (key === "precio_dolares") params.push(parseFloat(value));
        else if (key === "existencias" || key === "id_categoria")
          params.push(parseInt(value));
        else if (key === "disponible") params.push(Boolean(value));
        else params.push(value?.toString().trim() || "");

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
            UPDATE Producto 
            SET ${setParts.join(", ")}
            WHERE id_producto = $${paramCount}
            RETURNING *
           `,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: "Producto actualizado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    // Borrado lógico en lugar de DELETE físico
    const result = await pool.query(
      `
            UPDATE Producto 
            SET Disponible = false 
            WHERE id_producto = $1
            RETURNING id_producto, Nombre
        `,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: "Producto eliminado exitosamente",
      producto: result.rows[0],
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

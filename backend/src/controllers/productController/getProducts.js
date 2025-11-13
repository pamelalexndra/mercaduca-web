import pool from "../../database/db.js";

export const getProducts = async (req, res) => {
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
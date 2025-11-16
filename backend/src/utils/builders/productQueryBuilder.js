// utils/builders/productQueryBuilder.js
/**
 * Construye la consulta SQL dinámica para productos basada en filtros.
 * @param {Object} filtros - Objeto con los parámetros de query (req.query)
 * @returns {Object} { query, params, filtrosAplicados }
 */
export const buildProductQuery = (filtros) => {
    const {
        ids,
        precio_min,
        precio_max,
        ordenar = "fecha_desc",
        emprendimiento_id,
        limit,
        search,
    } = filtros;

    // 1. Consulta Base
    let sqlParts = [
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

    let params = [];
    let filtrosAplicados = {};

    // Helper interno para obtener el índice actual ($1, $2, etc.)
    const getNextIndex = () => `$${params.length + 1}`;

    // 2. Filtro por Búsqueda de Texto
    if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        const idx = getNextIndex();

        sqlParts.push(` AND (
        LOWER(p.Nombre) LIKE ${idx} 
        OR LOWER(p.Descripcion) LIKE ${idx}
        OR LOWER(e.Nombre) LIKE ${idx}
        OR LOWER(c.Categoria) LIKE ${idx}
      )`);
        params.push(searchTerm);
        filtrosAplicados.search = search.trim();
    }

    // 3. Filtro por Categorías (IDs múltiples)
    if (ids) {
        const categoriasIds = ids
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => id > 0);

        if (categoriasIds.length > 0) {
            const placeholders = categoriasIds
                .map((_, i) => `$${params.length + i + 1}`)
                .join(",");

            sqlParts.push(` AND p.id_categoria IN (${placeholders})`);
            params.push(...categoriasIds);
            filtrosAplicados.categorias = categoriasIds;
        }
    }

    // 4. Filtro por Emprendimiento
    if (emprendimiento_id && !isNaN(emprendimiento_id)) {
        sqlParts.push(` AND p.id_emprendimiento = ${getNextIndex()}`);
        params.push(parseInt(emprendimiento_id));
        filtrosAplicados.emprendimiento_id = parseInt(emprendimiento_id);
    }

    // 5. Filtros por Precio
    if (!isNaN(parseFloat(precio_min))) {
        sqlParts.push(` AND p.Precio_dolares >= ${getNextIndex()}`);
        params.push(parseFloat(precio_min));
        filtrosAplicados.precio_min = parseFloat(precio_min);
    }

    if (!isNaN(parseFloat(precio_max))) {
        sqlParts.push(` AND p.Precio_dolares <= ${getNextIndex()}`);
        params.push(parseFloat(precio_max));
        filtrosAplicados.precio_max = parseFloat(precio_max);
    }

    // 6. Ordenamiento
    const ordenamientos = {
        precio_asc: "p.Precio_dolares ASC",
        precio_desc: "p.Precio_dolares DESC",
        fecha_desc: "p.Fecha_registro DESC",
        fecha_asc: "p.Fecha_registro ASC",
        nombre_asc: "e.Nombre ASC",
        nombre_desc: "e.Nombre DESC",
    };

    const clausulaOrden = ordenamientos[ordenar] || ordenamientos.fecha_desc;
    sqlParts.push(` ORDER BY ${clausulaOrden}`);
    filtrosAplicados.ordenamiento = ordenar;

    // 7. Límite
    if (limit && !isNaN(parseInt(limit))) {
        sqlParts.push(` LIMIT ${getNextIndex()}`);
        params.push(parseInt(limit));
        filtrosAplicados.limit = parseInt(limit);
    }

    return {
        query: sqlParts.join(" "),
        params,
        filtrosAplicados,
    };
};

/**
 * Construye la query dinámica para un UPDATE parcial (PATCH).
 * @param {string|number} id - ID del producto
 * @param {Object} updates - Objeto con los campos a actualizar (req.body)
 * @returns {Object} { query, params, count } - Query string, array de parámetros y cantidad de campos
 */
export const buildProductQueryUpdate = (id, updates) => {
    // Mapeo de nombre en JSON (req.body) -> nombre en Base de Datos
    const dbMap = {
        nombre: "Nombre",
        descripcion: "Descripcion",
        imagen_url: "Imagen_URL",
        precio_dolares: "Precio_dolares",
        existencias: "Existencias",
        disponible: "Disponible",
        id_categoria: "id_categoria",
    };

    const setParts = [];
    const params = [];
    let paramCount = 1;

    // Iteramos sobre las claves enviadas en el body
    for (const [key, value] of Object.entries(updates)) {
        // Solo procesamos si el campo existe en nuestro mapa permitido
        if (dbMap[key]) {
            setParts.push(`${dbMap[key]} = $${paramCount}`);

            // Lógica de conversión de tipos
            if (key === "precio_dolares") {
                params.push(parseFloat(value));
            } else if (key === "existencias" || key === "id_categoria") {
                params.push(parseInt(value));
            } else if (key === "disponible") {
                params.push(Boolean(value));
            } else {
                params.push(value?.toString().trim() || "");
            }

            paramCount++;
        }
    }

    // Si no hay campos válidos, retornamos null o vacío para manejarlo en el controlador
    if (setParts.length === 0) {
        return { query: null, params: [], count: 0 };
    }

    // Agregamos el ID como último parámetro
    params.push(parseInt(id));

    const query = `
      UPDATE Producto 
      SET ${setParts.join(", ")}
      WHERE id_producto = $${paramCount}
      RETURNING *
  `;

    return { query, params, count: setParts.length };
};
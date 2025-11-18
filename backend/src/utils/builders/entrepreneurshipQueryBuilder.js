// utils/builders/entrepreneurshipQueryBuilder.js
/**
 * Construye la consulta SQL dinámica para obtener emprendimientos.
 * Incluye lógica de búsqueda por texto (search).
 * @param {Object} filtros - req.query
 * @returns {Object} { query, params, filtrosAplicados }
 */
export const buildEntrepreneurshipQuery = (filtros) => {
  const { ids, ordenar = "fecha_desc", search } = filtros;

  // 1. Consulta Base
  let sqlParts = [
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

  let params = [];
  let filtrosAplicados = {};

  const getNextIndex = () => `$${params.length + 1}`;

  // 2. NUEVO: Filtro por Búsqueda de Texto
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    const idx = getNextIndex();

    sqlParts.push(` AND (
        LOWER(e.Nombre) LIKE ${idx} 
        OR LOWER(e.Descripcion) LIKE ${idx}
    )`);
    params.push(searchTerm);
    filtrosAplicados.search = search.trim();
  }

  // 3. Filtro por Categorías
  if (ids) {
    const categoriasIds = ids
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => id > 0);

    if (categoriasIds.length > 0) {
      const placeholders = categoriasIds
        .map((_, i) => `$${params.length + i + 1}`)
        .join(",");
      sqlParts.push(` AND e.id_categoria IN (${placeholders})`);
      params.push(...categoriasIds);
      filtrosAplicados.categorias = categoriasIds;
    }
  }

  // 4. Ordenamiento
  const ordenamientos = {
    fecha_desc: "e.Fecha_registro DESC",
    fecha_asc: "e.Fecha_registro ASC",
    nombre_asc: "e.Nombre ASC",
    nombre_desc: "e.Nombre DESC",
  };

  const clausulaOrden = ordenamientos[ordenar] || ordenamientos.fecha_desc;
  sqlParts.push(`ORDER BY ${clausulaOrden}`);
  filtrosAplicados.ordenamiento = ordenar;

  return {
    query: sqlParts.join(" "),
    params,
    filtrosAplicados,
  };
};

/**
 * Construye la query dinámica para UPDATE parcial de emprendimientos.
 * @param {string|number} id
 * @param {Object} updates
 */
export const buildEntrepreneurshipQueryUpdate = (id, updates) => {
  // Mapa: req.body -> Columna DB
  const dbMap = {
    nombre: "Nombre",
    descripcion: "Descripcion",
    imagen_url: "Imagen_URL",
    instagram: "Instagram",
    disponible: "Disponible",
    id_categoria: "id_categoria",
  };

  const setParts = [];
  const params = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (dbMap[key]) {
      setParts.push(`${dbMap[key]} = $${paramCount}`);

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
    return { query: null, params: [], count: 0 };
  }

  params.push(parseInt(id));

  const query = `
      UPDATE Emprendimiento 
      SET ${setParts.join(", ")}
      WHERE id_emprendimiento = $${paramCount}
      RETURNING *
  `;

  return { query, params, count: setParts.length };
};

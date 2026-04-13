// utils/builders/entrepreneurshipQueryBuilder.js
export const buildEntrepreneurshipQuery = (filtros) => {
  const { ids, ordenar, search, limit } = filtros;

  let sqlParts = [
    `SELECT
        e.id_emprendimiento AS id,
        e.Nombre AS nombre,
        e.Descripcion AS descripcion,
        e.Disponible AS disponible,
        e.Imagen_URL AS imagen,
        e.Instagram AS instagram,
        e.Fecha_registro,
        c.id_categoria AS categoria_id,
        c.Categoria AS categoria_nombre,
        
        -- NUEVOS CAMPOS DE BOXFUL (Se eliminaron los viejos)
        e.boxful_email,
        e.boxful_address_id,
        e.boxful_allows_card_payment,
        e.boxful_courier_id
    FROM Emprendimiento e
    JOIN Categorias c ON e.id_categoria = c.id_categoria
    WHERE e.Disponible = true`,
  ];

  let params = [];
  let filtrosAplicados = {};

  const getNextIndex = () => `$${params.length + 1}`;

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

  const ordenamientos = {
    fecha_desc: "e.Fecha_registro DESC",
    fecha_asc: "e.Fecha_registro ASC",
    nombre_asc: "e.Nombre ASC",
    nombre_desc: "e.Nombre DESC",
  };

  const clausulaOrden = ordenamientos[ordenar] || ordenamientos.fecha_desc;

  sqlParts.push(`ORDER BY ${clausulaOrden}`);
  filtrosAplicados.ordenamiento = ordenar;

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
 * UPDATE parcial de emprendimientos
 */
export const buildEntrepreneurshipQueryUpdate = (id, updates) => {
  const dbMap = {
    nombre: "Nombre",
    descripcion: "Descripcion",
    imagen_url: "Imagen_URL",
    instagram: "Instagram",
    disponible: "Disponible",
    id_categoria: "id_categoria",

    boxful_email: "boxful_email",
    boxful_password: "boxful_password", 
    boxful_address_id: "boxful_address_id",
    boxful_allows_card_payment: "boxful_allows_card_payment",
    boxful_courier_id: "boxful_courier_id",
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
      } else if (key === "boxful_allows_card_payment") {
        params.push(value === true || value === "true" ? true : false);
      } else if (key === "boxful_address_id" || key === "boxful_courier_id") {
        params.push(value ? value.toString() : null);
      } else {
        params.push(value?.toString().trim() || null);
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

  return {
    query,
    params,
    count: setParts.length,
  };
};
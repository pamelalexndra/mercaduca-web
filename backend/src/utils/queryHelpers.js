// src/utils/queryHelpers.js

export const buildDynamicUpdateQuery = (table, idField, idValue, updates, allowedFields) => {
    const setParts = [];
    const params = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            // Mapeo simple de nombres de campos si difieren DB vs Frontend
            // Puedes expandir este objeto si tienes más discrepancias
            const fieldMap = {
                precio_dolares: "Precio_dolares",
                imagen_url: "Imagen_URL",
                id_categoria: "id_categoria",
                existencias: "Existencias",
                disponible: "Disponible",
                nombre: "Nombre",
                descripcion: "Descripcion"
            };

            const dbField = fieldMap[key] || key;

            setParts.push(`${dbField} = $${paramCount}`);
            params.push(value);
            paramCount++;
        }
    }

    if (setParts.length === 0) return null;

    // ID al final para el WHERE
    params.push(idValue);

    const query = `
    UPDATE ${table} 
    SET ${setParts.join(", ")}
    WHERE ${idField} = $${paramCount}
    RETURNING *
  `;

    return { query, params };
};
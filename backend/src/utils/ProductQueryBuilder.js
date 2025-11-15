// src/utils/ProductQueryBuilder.js

export class ProductQueryBuilder {
    constructor() {
        // Definimos la query base con los JOINS comunes para reutilizarla
        this.baseQuery = `
      SELECT
        p.id_producto AS id,
        p.Nombre AS nombre,
        p.Precio_dolares AS precio,
        c.Categoria AS categoria,
        p.Descripcion AS descripcion,
        p.Imagen_URL AS imagen,
        p.Existencias AS stock,
        p.Disponible AS disponible,
        p.Fecha_registro,
        p.id_categoria,
        p.id_emprendimiento,
        e.Nombre AS nombre_emprendimiento,
        e.id_emprendimiento AS emprendimiento_id
      FROM Producto AS p
      JOIN Categorias AS c ON p.id_categoria = c.id_categoria
      JOIN Emprendimiento AS e ON p.id_emprendimiento = e.id_emprendimiento
    `;
        // Por defecto filtramos disponibles, pero permitimos desactivarlo (útil para admin o update)
        this.conditions = ["WHERE 1=1"];
        this.params = [];
        this.limit = null;
        this.orderBy = "p.Fecha_registro DESC";
        this.filtrosAplicados = {};
    }

    // Filtro básico: solo disponibles (default true)
    onlyAvailable(isAvailable = true) {
        if (isAvailable) {
            this.addCondition("p.Disponible = true");
        }
        return this;
    }

    // Agregar condición genérica
    addCondition(sqlCondition, value = null, filterName = null, filterValue = null) {
        if (value !== null) {
            const paramIndex = `$${this.params.length + 1}`;
            // Reemplazamos ? por $n
            const finalCondition = sqlCondition.replace('?', paramIndex);
            this.conditions.push(`AND ${finalCondition}`);
            this.params.push(value);
        } else {
            // Condición sin parámetros (ej: "p.deleted_at IS NULL")
            this.conditions.push(`AND ${sqlCondition}`);
        }

        if (filterName) this.filtrosAplicados[filterName] = filterValue;
        return this;
    }

    // Condición IN para arrays
    addInCondition(column, values, filterName) {
        if (!values || values.length === 0) return this;
        const placeholders = values.map((_, i) => `$${this.params.length + i + 1}`).join(",");
        this.conditions.push(`AND ${column} IN (${placeholders})`);
        this.params.push(...values);
        if (filterName) this.filtrosAplicados[filterName] = values;
        return this;
    }

    setSort(sortKey) {
        const ordenamientos = {
            precio_asc: "p.Precio_dolares ASC",
            precio_desc: "p.Precio_dolares DESC",
            fecha_desc: "p.Fecha_registro DESC",
            fecha_asc: "p.Fecha_registro ASC",
            nombre_asc: "e.Nombre ASC",
            nombre_desc: "e.Nombre DESC",
        };
        if (sortKey && ordenamientos[sortKey]) {
            this.orderBy = ordenamientos[sortKey];
            this.filtrosAplicados.ordenamiento = sortKey;
        }
        return this;
    }

    setLimit(limit) {
        const limitVal = parseInt(limit);
        if (!isNaN(limitVal) && limitVal > 0) {
            this.limit = limitVal;
            this.filtrosAplicados.limit = limitVal;
        }
        return this;
    }

    build() {
        let query = `${this.baseQuery} ${this.conditions.join(" ")} ORDER BY ${this.orderBy}`;

        if (this.limit) {
            query += ` LIMIT $${this.params.length + 1}`;
            this.params.push(this.limit);
        }

        return { query, params: this.params, filtros: this.filtrosAplicados };
    }
}
// hooks/useProducts.js
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../utils/api";

export default function useProducts(baseUrl = `${API_BASE_URL}/products`) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para enriquecer un producto con sus datos completos
  const enrichProduct = async (producto) => {
    // Si ya tiene los campos necesarios, devolverlo directamente
    if (
      producto.id_categoria !== undefined &&
      producto.id_emprendimiento !== undefined
    ) {
      return producto;
    }

    // Si no, hacer fetch del detalle del producto
    try {
      const productId = producto.id || producto.id_producto;
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        const detalle = data.producto || data;

        return {
          ...producto,
          id_categoria: detalle.id_categoria || producto.id_categoria,
          id_emprendimiento:
            detalle.id_emprendimiento || producto.id_emprendimiento,
          categoria: detalle.categoria || producto.categoria,
          descuento: detalle.descuento || producto.descuento,
        };
      }
    } catch (err) {
      console.error(`Error enriching product ${producto.id}:`, err);
    }

    return producto;
  };

  // Función para enriquecer múltiples productos en paralelo
  const enrichProducts = async (productos) => {
    const productosEnriquecidos = await Promise.all(
      productos.map(async (producto) => {
        if (
          producto.id_categoria === undefined ||
          producto.id_emprendimiento === undefined
        ) {
          return await enrichProduct(producto);
        }
        return producto;
      }),
    );

    return productosEnriquecidos;
  };

  const fetchProducts = useCallback(
    async (categoryIds = [], search = "", options = {}) => {
      try {
        setLoading(true);
        setError(null);

        let url = baseUrl;
        const params = [];

        if (categoryIds.length > 0) params.push(`ids=${categoryIds.join(",")}`);
        if (search && search.trim() !== "")
          params.push(`search=${encodeURIComponent(search.trim())}`);

        if (options.min) params.push(`precio_min=${options.min}`);
        if (options.max) params.push(`precio_max=${options.max}`);
        if (options.sort) params.push(`ordenar=${options.sort}`);

        if (params.length) url += `?${params.join("&")}`;

        const response = await fetch(url);

        if (!response.ok) throw new Error("Error al cargar productos");

        const data = await response.json();
        let productos = data.productos || data.data || [];

        // ENRIQUECER PRODUCTOS con categoría y emprendimiento
        productos = await enrichProducts(productos);

        if (
          categoryIds.length === 0 &&
          !search &&
          Object.keys(options).length === 0
        ) {
          setAllProducts(productos);
        }
        setFilteredProducts(productos);
      } catch (err) {
        setError(err.message || String(err));
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  const resetOrFetchAll = useCallback(() => {
    if (allProducts.length > 0) {
      setFilteredProducts(allProducts);
    } else {
      fetchProducts();
    }
  }, [allProducts, fetchProducts]);

  return {
    allProducts,
    filteredProducts,
    loading,
    error,
    fetchProducts,
    resetOrFetchAll,
  };
}
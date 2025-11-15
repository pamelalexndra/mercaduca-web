// hooks/useProducts.js
import { useCallback, useState } from "react";

/**
 * useProducts
 * - Encapsula fetchProducts + estados relacionados (allProducts, filteredProducts, loading, error).
 * - NOTA: no fuerza setLoading(true) dentro de cada fetch para evitar "parpadeos".
 */
export default function useProducts(
  baseUrl = "http://localhost:5000/api/productos"
) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); // true hasta la primera respuesta
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(
    async (categoryIds = [], search = "") => {
      try {
        setError(null);
        // IMPORTANT: no setLoading(true) aquí para evitar parpadeos en fetchs posteriores.

        let url = baseUrl;
        const params = [];

        if (categoryIds.length > 0) params.push(`ids=${categoryIds.join(",")}`);
        if (search && search.trim() !== "")
          params.push(`search=${encodeURIComponent(search.trim())}`);
        if (params.length) url += `?${params.join("&")}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar productos");

        const data = await response.json();
        const productos = data.productos || [];

        if (categoryIds.length === 0 && !search) {
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
    [baseUrl]
  );

  /**
   * resetOrFetchAll:
   * - Si allProducts ya existe, lo usa para setFilteredProducts (respuesta instantánea).
   * - Si no hay allProducts, hace fetchProducts() sin filtros.
   */
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

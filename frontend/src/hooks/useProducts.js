// hooks/useProducts.js
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../utils/api";

export default function useProducts(baseUrl = `${API_BASE_URL}/products`) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(
    async (categoryIds = [], search = "", options = {}) => {
      try {
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
        const productos = data.productos || [];

        if (categoryIds.length === 0 && !search && Object.keys(options).length === 0) {
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

import { useCallback, useState } from "react";
import { API_BASE_URL } from "../utils/api";

export default function useEntrepreneurships() {
  const [entrepreneurships, setEntrepreneurships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntrepreneurships = useCallback(
    async (categoryIds = [], search = "", options = {}) => {
      try {
        setError(null);
        setLoading(true);

        let url = `${API_BASE_URL}/entrepreneurship`;
        const params = [];

        if (categoryIds.length > 0) params.push(`ids=${categoryIds.join(",")}`);
        if (search && search.trim() !== "")
          params.push(`search=${encodeURIComponent(search.trim())}`);

        if (options.sort) params.push(`ordenar=${options.sort}`);

        // Note: Entrepreneurship backend might need to handle 'ids' vs 'categories'.
        // Checking backend query builder: it uses 'ids'.

        if (params.length) url += `?${params.join("&")}`;

        const response = await fetch(url);
        if (!response.ok)
          throw new Error("Error al cargar los emprendimientos");

        const data = await response.json();
        // Backend returns: { emprendimientos: [], total: ..., filtros: ... }
        // OR array if no filters? Let's check backend controller.
        // Controller returns: res.json({ emprendimientos: result.rows, ... });
        // The original fetch in Entrepreneurship.jsx handled: const lista = Array.isArray(data) ? data : data.emprendimientos || [];

        const lista = Array.isArray(data) ? data : data.emprendimientos || [];
        setEntrepreneurships(lista);
      } catch (err) {
        console.error("Error cargando emprendimientos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    entrepreneurships,
    loading,
    error,
    fetchEntrepreneurships,
  };
}

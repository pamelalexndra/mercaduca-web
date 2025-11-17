import { useEffect, useState } from "react";

export default function useCategories(availableOnly) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = "http://localhost:5000/api/categories";
        const url = availableOnly ? `${baseUrl}?available=true` : baseUrl;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();

        if (!mounted) return;
        setCategories(data.data || data);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching categories:", err);
        if (mounted) {
          setError(err.message);
          setCategories(["Sin categorías disponibles"]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [availableOnly]);

  return { categories, loading, error };
}
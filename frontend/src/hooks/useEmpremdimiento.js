// src/hooks/useEmprendimiento.js
import { useEffect, useState } from "react";

export function useEmprendimiento(id) {
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/emprendimientos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el emprendimiento");
        return res.json();
      })
      .then((data) => {
        setEmprendimiento(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return { emprendimiento, loading, error };
}

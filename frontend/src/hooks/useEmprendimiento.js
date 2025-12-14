import { useEffect, useState } from "react";
import { deleteEntrepreneurshipService } from "../services/entrepreneurship.service";
import { API_BASE_URL } from "../utils/api";

export function useEmprendimiento(id) {
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/api/entrepreneurship/${id}`)
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

  const removeEntrepreneurship = async (idToDelete) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay sesión activa");

      await deleteEntrepreneurshipService(idToDelete, token);
      return true;
    } catch (err) {
      setDeleteError(err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    emprendimiento,
    loading,
    error,
    removeEntrepreneurship,
    deleting,
    deleteError,
  };
}

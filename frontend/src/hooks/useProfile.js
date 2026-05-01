// hooks/useProfile.js
import { useState } from "react";
import { API_BASE_URL } from "../utils/api";

export function useProfile() {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState(null);

  const removeProfile = async (userId, token) => {
    setLoadingDelete(true);
    setErrorDelete(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el perfil");
      }

      return true;
    } catch (err) {
      setErrorDelete(err.message);
      return false;
    } finally {
      setLoadingDelete(false);
    }
  };

  return {
    removeProfile,
    loadingDelete,
    errorDelete,
  };
}
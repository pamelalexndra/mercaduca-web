import { useState } from "react";
import { deleteUserProfile } from "../services/user.service";

export function useProfile() {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState(null);

  const removeProfile = async (userId) => {
    setLoadingDelete(true);
    setErrorDelete(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      await deleteUserProfile(userId, token);
      return true;
    } catch (err) {
      setErrorDelete(err.message || "Error al eliminar el perfil");
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

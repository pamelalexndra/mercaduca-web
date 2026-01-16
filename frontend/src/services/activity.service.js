import { API_BASE_URL } from "../utils/api.js";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const activityService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/api/activities`);
    if (!res.ok) throw new Error("Error al obtener actividades");
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/activities`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar la actividad");
    return res.json();
  },
};

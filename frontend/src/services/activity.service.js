import { API_BASE_URL } from "../utils/api.js";

const getToken = () => localStorage.getItem("token");

export const activityService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/activities`);
    if (!response.ok) {
      throw new Error("Error al obtener actividades");
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener actividad");
    }
    return response.json();
  },

  create: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al crear actividad");
    }
    return data;
  },

  update: async (id, formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar actividad");
    }
    return data;
  },

  delete: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar actividad");
    }
    return data;
  },
};
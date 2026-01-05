const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.warn("VITE_API_URL no está definida, revisar archivo .env")
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const activityService = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/activities`);
    if (!res.ok) throw new Error("Error al obtener actividades");
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/activities/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar la actividad");
    return res.json();
  }
};
const BASE_URL = import.meta.env.VITE_API_URL;

export const deleteEntrepreneurshipService = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/emprendimientos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar el emprendimiento");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
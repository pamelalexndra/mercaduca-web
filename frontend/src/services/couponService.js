import { API_BASE_URL } from "../utils/api";

export const getCuponesPorCategoria = async (id_categoria) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/cupones?id_categoria=${id_categoria}&solo_disponibles=true`
    );

    const data = await res.json();

    return data.cupones || [];

  } catch (error) {
    console.error("Error obteniendo cupones:", error);
    return [];
  }
};
import { API_BASE_URL } from "../utils/api";

export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Error obteniendo producto");
  return await res.json();
};

export const getEntrepreneurshipById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/entrepreneurship/${id}`);
  if (!res.ok) throw new Error("Error obteniendo emprendimiento");
  return await res.json();
};

export const updateProductAPI = async (id, data, token) => {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Error actualizando");
  return result;
};

export const deleteProductAPI = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error eliminando");
  return true;
};

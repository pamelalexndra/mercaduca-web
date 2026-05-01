import { API_BASE_URL } from "../utils/api";

export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Error obteniendo producto");
  return await res.json();
};

export const getEntrepreneurshipById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/entrepreneurship/${id}`);
  if (!res.ok) throw new Error("Error obteniendo emprendimiento");
  return await res.json();
};

export const createProductService = async (formData, token) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Error creando producto");
  return result;
};

export const updateProductService = async (id, formData, token) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Error actualizando producto");
  return result;
};

export const updateProductPartialService = async (id, formData, token) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Error actualizando producto");
  return result;
};

export const deleteProductAPI = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error eliminando");
  return true;
};

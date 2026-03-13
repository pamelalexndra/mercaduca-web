import { API_BASE_URL } from "../utils/api";

export async function getCuponesPorProducto(id_producto) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cupones?id_producto=${id_producto}&solo_disponibles=true`,
  );

  if (!res.ok) {
    throw new Error("Error obteniendo cupones");
  }

  const data = await res.json();
  return data.cupones;
}

export async function getCuponesPorCategoria(id_categoria) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cupones?id_categoria=${id_categoria}&solo_disponibles=true`,
  );

  if (!res.ok) {
    throw new Error("Error obteniendo cupones por categoría");
  }

  const data = await res.json();
  return data.cupones;
}

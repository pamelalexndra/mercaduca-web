// src/services/boxful.service.js
const BOXFUL_API = process.env.BOXFUL_API_URL || "https://devapi.goboxful.com";

// Función base que hace las peticiones (se mantiene igual)
export const boxfulFetch = async (path, options = {}) => {
  const res = await fetch(`${BOXFUL_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Boxful error ${res.status}`);
  }
  return res.json();
};

/**
 * Obtiene el token de Boxful usando las credenciales dinámicas de un usuario
 */
export const getUserBoxfulToken = async (email, password) => {
  const data = await boxfulFetch("/auth/client", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return data.accessToken;
};

/**
 * Valida las credenciales y trae las direcciones de la cuenta
 * Función que usará el endpoint /validate-credentials de tu frontend
 */
export const getUserAddresses = async (email, password) => {
  // 1. Validamos que las credenciales sirvan (si falla, tira un error)
  const token = await getUserBoxfulToken(email, password);

  // 2. Traemos las direcciones del cliente usando su token
  const data = await boxfulFetch("/addresses", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Dependiendo de cómo devuelva Boxful la data, puede venir en un array directo o en data.addresses
  return data.addresses || data || [];
};

/**
 * Crea el link de envío usando el token del emprendedor y su dirección guardada
 */
export const createShipByLink = async (emprendimiento, parcels, userEmail, plainPassword) => {
  const token = await getUserBoxfulToken(userEmail, plainPassword);

  const generalAmount = parcels.reduce(
    (sum, p) => sum + (p.unitPrice * p.quantity), 0
  );

  const payload = {
    recollectionId: emprendimiento.boxful_address_id,
    requiresPayment: true,
    allowsCardPayment: emprendimiento.boxful_allows_card_payment ?? true,
    allowsCodPayment: emprendimiento.boxful_allows_cod_payment ?? false,
    email: userEmail,
    generalAmount: generalAmount,
    isPaidByFinalClient: false,
    parcels: parcels,
  };

  if (emprendimiento.boxful_courier_id) {
    payload.courierId = emprendimiento.boxful_courier_id;
  } else if (process.env.BOXFUL_DEFAULT_COURIER_ID) {
    payload.courierId = process.env.BOXFUL_DEFAULT_COURIER_ID;
  }

  const BOXFUL_API_URL = process.env.BOXFUL_API_URL || "https://devapi.goboxful.com";

  const response = await fetch(`${BOXFUL_API_URL}/ship-by-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error devuelto por la API de Boxful");
  }

  return data;
};

/**
 * Para ver los couriers, se le pasan las credenciales
 */
export const getAvailableCouriers = async (userEmail, userPassword) => {
  const token = await getUserBoxfulToken(userEmail, userPassword);

  const data = await boxfulFetch("/courier/available", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

export const getBoxfulCouriers = async (token) => {
  try {
    const BOXFUL_API_URL = process.env.BOXFUL_API_URL || "https://api.goboxful.com";
    
    const response = await fetch(`${BOXFUL_API_URL}/courier/shiphero`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error obteniendo couriers de Boxful:", error);
    return [];
  }
};
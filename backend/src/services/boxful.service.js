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
export const createShipByLink = async (emprendimiento, emprendedor, parcels, userEmail, userPassword) => {
  // Obtenemos el token del emprendedor en ese momento
  const token = await getUserBoxfulToken(userEmail, userPassword);

  const generalAmount = parcels.reduce(
    (sum, p) => sum + (p.unitPrice * p.quantity), 0
  );

  const payload = {
    // Como ahora seleccionan la dirección de Boxful, pasamos el ID directamente
    recollectionAddressId: emprendimiento.boxful_address_id, 
    recollectionPhoneAreaCode: emprendimiento.boxful_phone_area_code || "503",
    recollectionPhone: emprendedor.telefono,
    requiresPayment: true,
    allowsCardPayment: emprendimiento.boxful_allows_card_payment ?? true,
    allowsCodPayment: true,
    generalAmount: generalAmount,
    isPaidByFinalClient: false,
    courierId: emprendimiento.boxful_courier_id || process.env.BOXFUL_DEFAULT_COURIER_ID,
    parcels,
  };

  console.log("Payload enviado a Boxful: ", payload);

  const data = await boxfulFetch("/ship-by-link", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

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
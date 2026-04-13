// src/services/boxful.service.js
const BOXFUL_API = process.env.BOXFUL_API_URL || "https://devapi.goboxful.com";
let cachedToken = null;
let tokenExpiry = null;

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

export const getBoxfulToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  console.log("EMAIL:", process.env.BOXFUL_EMAIL);
  console.log("PASSWORD:", process.env.BOXFUL_PASSWORD);
  console.log("API URL:", process.env.BOXFUL_API_URL);

  const data = await boxfulFetch("/auth/client", {
    method: "POST",
    body: JSON.stringify({
      email: process.env.BOXFUL_EMAIL,
      password: process.env.BOXFUL_PASSWORD,
    }),
  });

  cachedToken = data.accessToken;
  tokenExpiry = now + 60 * 60 * 1000;
  return cachedToken;
};

export const getStates = async () => {
  const token = await getBoxfulToken();
  const data = await boxfulFetch("/states", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.states;
};

export const createAddress = async (addressData) => {
  const token = await getBoxfulToken();
  const data = await boxfulFetch("/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      address: addressData.address,
      referencePoint: addressData.referencePoint,
      latitude: addressData.latitude || 13.6929,
      longitude: addressData.longitude || -89.2182,
      stateId: addressData.stateId,
      cityId: addressData.cityId,
      addressPhone: addressData.addressPhone,
      addressAreaCode: addressData.addressAreaCode || "503",
    }),
  });
  return data.address;
};

export const createShipByLink = async (emprendimiento, emprendedor, parcels) => {
  const token = await getBoxfulToken();

  const generalAmount = parcels.reduce(
    (sum, p) => sum + (p.unitPrice * p.quantity), 0
  );

  console.log("COURIER ID:", process.env.BOXFUL_DEFAULT_COURIER_ID);

  const payload = {
    recollectionAddress: emprendimiento.direccion_recoleccion,
    recollectionAddressReferencePoint: emprendimiento.referencia_recoleccion || "",
    recollectionState: emprendimiento.boxful_state_id,
    recollectionCity: emprendimiento.boxful_city_id,
    recollectionPhoneAreaCode: emprendimiento.boxful_phone_area_code || "503",
    recollectionPhone: emprendedor.telefono,
    requiresPayment: true,
    allowsCardPayment: emprendimiento.boxful_allows_card_payment ?? true,
    allowsCodPayment: true,
    generalAmount: generalAmount,
    isPaidByFinalClient: false,
    courierId: process.env.BOXFUL_DEFAULT_COURIER_ID,
    parcels,
  };

  console.log("Payload enviado a Boxful: ", payload);

  const data = await boxfulFetch("/ship-by-link", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  console.log("RESPONSE: ", data);
  return data;
};

export const getAvailableCouriers = async () => {
  const token = await getBoxfulToken();

  const data = await boxfulFetch("/courier/available", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};
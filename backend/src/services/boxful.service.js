// src/services/boxful.service.js
const BOXFUL_API = "https://api.goboxful.com";

let cachedToken = null;
let tokenExpiry = null;

const boxfulFetch = async (path, options = {}) => {
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

const getBoxfulToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }
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

export const getQuote = async (recollectionCityId, customerCityId) => {
  const token = await getBoxfulToken();
  const data = await boxfulFetch("/quoter", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recollectionCityId, customerCityId }),
  });
  return data.couriers;
};

export const createOrder = async (orderData) => {
  const token = await getBoxfulToken();
  const data = await boxfulFetch("/shiphero/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      cityId: orderData.customerCityId,
      completeName: orderData.completeName,
      email: orderData.email || "",
      customerAreaCode: "503",
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerReferencePoint: orderData.customerReferencePoint,
      cod: true,
      courierId: orderData.courierId,
      totalTax: 0,
      subtotal: orderData.productPrice,
      totalDiscounts: 0,
      totalPrice: orderData.productPrice,
      shippingCost: orderData.shippingCost,
      isFragile: false,
      makeCustomerFavorite: false,
      isFavoriteCustomerSelected: false,
      favoriteCustomerId: null,
      products: [{
        sku: String(orderData.productId),
        quantity: 1,
        price: orderData.productPrice,
        productName: orderData.productName,
      }],
    }),
  });
  return data.shipmentData;
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
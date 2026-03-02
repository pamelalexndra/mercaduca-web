import axios from "axios";

const BOXFUL_API = "https://api.goboxful.com";

// Cache del token para no autenticar en cada petición
let cachedToken = null;
let tokenExpiry = null;

/**
 * Obtiene un token de Boxful, usando caché si aún es válido.
 * Las credenciales viven SOLO en el servidor (variables de entorno).
 */
const getBoxfulToken = async () => {
  const now = Date.now();

  // El token dura ~1h, renovamos con 5min de margen
  if (cachedToken && tokenExpiry && now < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const response = await axios.post(`${BOXFUL_API}/auth/client`, {
    email: process.env.BOXFUL_EMAIL,
    password: process.env.BOXFUL_PASSWORD,
  });

  cachedToken = response.data.accessToken;
  tokenExpiry = now + 60 * 60 * 1000; // 1 hora
  return cachedToken;
};

/** Obtiene departamentos y municipios de El Salvador */
export const getStates = async () => {
  const token = await getBoxfulToken();
  const response = await axios.get(`${BOXFUL_API}/states`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.states;
};

/**
 * Cotiza el costo de envío entre dos ciudades.
 * @param {string} recollectionCityId - cityId del municipio del emprendedor
 * @param {string} customerCityId     - cityId del municipio del cliente
 */
export const getQuote = async (recollectionCityId, customerCityId) => {
  const token = await getBoxfulToken();
  const response = await axios.post(
    `${BOXFUL_API}/quoter`,
    { recollectionCityId, customerCityId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.couriers;
};

/**
 * Crea una orden de envío en Boxful.
 * @param {object} orderData - Datos del cliente, producto y courier seleccionado
 */
export const createOrder = async (orderData) => {
  const token = await getBoxfulToken();
  const response = await axios.post(
    `${BOXFUL_API}/shiphero/orders`,
    {
      cityId: orderData.customerCityId,
      completeName: orderData.completeName,
      email: orderData.email || "",
      customerAreaCode: "503",
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerReferencePoint: orderData.customerReferencePoint,
      cod: true, // Cobro Contra Entrega — cliente paga al recibir
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
      products: [
        {
          sku: String(orderData.productId),
          quantity: 1,
          price: orderData.productPrice,
          productName: orderData.productName,
        },
      ],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.shipmentData;
};
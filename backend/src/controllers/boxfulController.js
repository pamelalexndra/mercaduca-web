import { getStates, getQuote, createOrder, createAddress } from "../services/boxful.service.js";

export const handleGetStates = async (req, res) => {
  try {
    const states = await getStates();
    res.json({ states });
  } catch (error) {
    console.error("Error obteniendo estados de Boxful:", error.message);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
};

export const handleGetQuote = async (req, res) => {
  try {
    const { recollectionCityId, customerCityId } = req.body;

    if (!recollectionCityId || !customerCityId) {
      return res.status(400).json({
        message: "Se requieren recollectionCityId y customerCityId",
      });
    }

    const couriers = await getQuote(recollectionCityId, customerCityId);
    res.json({ couriers });
  } catch (error) {
    console.error("Error cotizando envío:", error.message);
    res.status(500).json({ message: "Error al cotizar el envío" });
  }
};

export const handleCreateOrder = async (req, res) => {
  try {
    const {
      completeName,
      email,
      customerPhone,
      customerAddress,
      customerReferencePoint,
      customerCityId,
      courierId,
      shippingCost,
      productId,
      productName,
      productPrice,
    } = req.body;

    // Validar campos obligatorios
    const required = {
      completeName,
      customerPhone,
      customerAddress,
      customerReferencePoint,
      customerCityId,
      courierId,
      productId,
      productName,
      productPrice,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Faltan campos: ${missing.join(", ")}`,
      });
    }

    const shipment = await createOrder({
      completeName,
      email,
      customerPhone,
      customerAddress,
      customerReferencePoint,
      customerCityId,
      courierId,
      shippingCost: shippingCost || 0,
      productId,
      productName,
      productPrice,
    });

    res.status(201).json({
      message: "Orden creada exitosamente",
      shipmentNumber: shipment.shipmentNumber,
      shipmentId: shipment.id,
    });
  } catch (error) {
    console.error("Error creando orden Boxful:", error.message);
    res.status(500).json({ message: "Error al crear la orden de envío" });
  }
};

export const handleCreateAddress = async (req, res) => {
  try {
    const addressInfo = req.body;
    const savedAddress = await createAddress(addressInfo);
    res.status(201).json({ address: savedAddress });
  } catch (error) {
    console.error("Error guardando dirección:", error.response?.data || error.message);
    res.status(500).json({ message: "Error al guardar la dirección" });
  }
};
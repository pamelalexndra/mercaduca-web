import { createOrder } from "../../services/boxful.service.js";

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
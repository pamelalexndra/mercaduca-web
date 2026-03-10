import { createAddress } from "../../services/boxful.service.js";

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
import { getQuote } from "../../services/boxful.service.js";

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
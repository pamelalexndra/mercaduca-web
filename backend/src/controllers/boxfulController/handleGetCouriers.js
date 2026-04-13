import { getBoxfulToken } from "../../services/boxful.service.js";
import { boxfulFetch } from "../../services/boxful.service.js";

export const handleGetCouriers = async (req, res) => {
  const { cityId } = req.params;
  try {
    const token = await getBoxfulToken();
    const data = await boxfulFetch(`/couriers?cityId=${cityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(data);
  } catch (err) {
    console.error("Error obteniendo couriers:", err.message);
    res.status(500).json({ error: "No se pudieron obtener los couriers." });
  }
};
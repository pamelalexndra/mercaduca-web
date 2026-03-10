import { getStates } from "../../services/boxful.service.js";

export const handleGetStates = async (req, res) => {
  try {
    const states = await getStates();
    res.json({ states });
  } catch (error) {
    console.error("Error obteniendo estados de Boxful:", error.message);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
};
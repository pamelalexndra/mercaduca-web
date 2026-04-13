// backend/src/controllers/boxful.controller.js 
import { getUserAddresses } from "../../services/boxful.service.js";

export const validateBoxfulCredentials = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "El correo y contraseña de Boxful son requeridos." });
  }

  try {
    // getUserAddresses hace el /auth/client y luego pide las direcciones
    const addresses = await getUserAddresses(email, password);
    
    return res.status(200).json({ addresses });
  } catch (error) {
    console.error("Error validando Boxful:", error.message);
    return res.status(401).json({ 
      message: "Credenciales de Boxful inválidas o error de conexión." 
    });
  }
};
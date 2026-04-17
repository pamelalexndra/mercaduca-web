import { getUserAddresses, getUserBoxfulToken, getBoxfulCouriers } from "../../services/boxful.service.js";

export const validateBoxfulCredentials = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "El correo y contraseña de Boxful son requeridos." });
  }

  try {
    const addresses = await getUserAddresses(email, password);
    
    const token = await getUserBoxfulToken(email, password);
    
    const couriers = await getBoxfulCouriers(token);
    
    return res.status(200).json({ addresses, couriers });
  } catch (error) {
    console.error("Error validando Boxful:", error.message);
    return res.status(401).json({ 
      message: "Credenciales de Boxful inválidas o error de conexión." 
    });
  }
};
// src/middlewares/authMiddleware.js
import { verifyToken } from "../jwt.js";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token requerido." });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Guardamos los datos del usuario en la request
        next(); // Continuamos al controlador
    } catch (error) {
        return res.status(403).json({ error: "Token inválido o expirado." });
    }
};
// src/middlewares/authMiddleware.js
import { verifyToken } from "../utils/auth/jwt.js";

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

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // Bearer Token -> Json Web Token 
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" }); // Hacer una salida controlada por error de autorización

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" }); // hacer una salida controlada porque el token no es válido

        // continuar al flujo con normalidad
        req.user = user;
        next();
    });
};
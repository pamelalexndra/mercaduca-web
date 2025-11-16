// src/utils/auth/jwt.js
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Generar token
export const generateToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

// Verificar token
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};
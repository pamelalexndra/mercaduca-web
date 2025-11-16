// src/controllers/authenticationController/logIn.js
import { findByUsername } from "../../utils/db/findByUsername.js";
import { verifyPassword } from "../../utils/auth/verifyPassword.js";
import { generateToken } from "../../utils/auth/jwt.js";

export const logIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Credenciales requeridas" });
        }

        // 1. Buscar usuario 
        const user = await findByUsername(username);

        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        // Verificamos si el emprendedor fue desactivado (borrado lógico)
        if (user.activo === false) {
            return res.status(403).json({
                success: false,
                message: "Esta cuenta ha sido desactivada. Contacte a soporte."
            });
        }

        // 2. Verificar contraseña
        const isValidPassword = await verifyPassword(password, user.contraseña);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        // 3. Generar Token
        const token = generateToken({ id: user.id_usuario, username: user.usuario });

        // 4. Responder
        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id_usuario,
                username: user.usuario,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};
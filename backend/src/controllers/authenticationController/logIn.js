import { findByUsername } from "../../utils/findByUsername.js";
import { verifyPassword } from "../../utils/verifyPassword.js";
import { generateToken } from "../../utils/jwt.js";

export const logIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Credenciales requeridas" });
        }

        // 1. Buscar usuario
        const user = await findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" }); // Mensaje genérico por seguridad
        }

        // 2. Verificar contraseña
        const isValidPassword = await verifyPassword(password, user.contraseña); // Nota: 'user.contraseña' viene de tu query en userController
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        // 3. Generar Token
        const token = generateToken({ id: user.id_usuario, username: user.usuario });

        // 4. Responder SIN enviar la contraseña
        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id_usuario,
                username: user.usuario,
                // ¡Password eliminado de aquí!
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};
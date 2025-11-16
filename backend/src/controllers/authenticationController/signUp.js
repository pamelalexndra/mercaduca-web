import { createProfile } from "../../services/createProfile.js";
import { generateToken } from "../../utils/auth/jwt.js"; // Importamos nuestra utilidad

export const signUp = async (req, res) => {
    try {
        const { username, password, nombres, apellidos, correo, telefono } = req.body;

        // Validación básica (puedes mover esto a un middleware de validación luego)
        if (!username || !password || !nombres || !apellidos || !correo || !telefono) {
            return res.status(400).json({ success: false, message: "Complete todos los campos" });
        }

        // Crear usuario
        const user = await createProfile({
            username,
            password,
            nombres,
            apellidos,
            correo,
            telefono,
        });

        // Generar token inmediatamente para que el usuario quede logueado al registrarse
        const token = generateToken({ id: user.id_usuario, username: user.usuario });

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            token, // Enviamos el token
            user: { id: user.id_usuario, username: user.usuario }, // NO enviamos password
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ success: false, message: "El usuario ya existe" });
        }
        console.error("Error en registro:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};
import { create, findByUsername, verifyPassword } from "./userController.js";

const sanitizeString = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value).trim();
  return "";
};

export const register = async (req, res) => {
  try {
    const rawData = req.body || {};
    const userData = {
      username: sanitizeString(rawData.username),
      password: typeof rawData.password === "string" ? rawData.password : "",
      nombres: sanitizeString(rawData.nombres),
      apellidos: sanitizeString(rawData.apellidos),
      correo: sanitizeString(rawData.correo),
      telefono: sanitizeString(rawData.telefono),
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8}$/;

    if (
      !userData.username ||
      !userData.password ||
      !userData.nombres ||
      !userData.apellidos ||
      !userData.correo ||
      !userData.telefono
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    if (userData.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    if (!emailRegex.test(userData.correo)) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico no es válido",
      });
    }

    if (!phoneRegex.test(userData.telefono)) {
      return res.status(400).json({
        success: false,
        message: "El teléfono debe tener 8 dígitos",
      });
    }

    const existingUser = await findByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
    }

    const user = await create(userData);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: { id: user.id_usuario, username: user.username },
    });
  } catch (error) {
    if (error.code === "23505") {
      // Código de violación de unique constraint en PostgreSQL
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
    }
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son requeridos",
      });
    }

    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      });
    }

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id_usuario,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const user = await findByUsername(req.params.username);
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ error: "Error verificando usuario" });
  }
};

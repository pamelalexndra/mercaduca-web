import { create, findByUsername, verifyPassword } from "./userController.js";

export const register = async (req, res) => {
  try {
    const { username, password, nombres, apellidos, correo, telefono } =
      req.body;

    if (
      !username ||
      !password ||
      !nombres ||
      !apellidos ||
      !correo ||
      !telefono
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    const user = await create({
      username,
      password,
      nombres,
      apellidos,
      correo,
      telefono,
    });

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: { id: user.id_usuario, username: user.usuario },
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

    const isValidPassword = await verifyPassword(password, user.contraseña);
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
        username: user.usuario,
        password: password,
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

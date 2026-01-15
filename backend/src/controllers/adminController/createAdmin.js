// src/controllers/adminController/createAdmin.js
import dotenv from "dotenv";
import { createAdminProfile } from "../../services/createAdminProfile.js";
import { validateAdmin } from "../../validators/adminValidator.js";
import { sanitizeInput } from "../../utils/helpers/sanitizer.js";

dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    const sanitizedData = {
      username: sanitizeInput(req.body.username),
      password: req.body.password,
      nombres: sanitizeInput(req.body.nombres),
      apellidos: sanitizeInput(req.body.apellidos),
      correo: sanitizeInput(req.body.correo?.toLowerCase()),
      telefono: sanitizeInput(req.body.telefono),
    };

    const { error, value } = validateAdmin(sanitizedData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const admin = await createAdminProfile(sanitizedData);

    res.status(201).json({
      success: true,
      message: "Administrador creado exitosamente.",
      data: {
        id_usuario: admin.id_usuario,
        id_emprendedor: admin.id_emprendedor,
        usuario: admin.usuario,
        rol: admin.rol,
        nombres: admin.nombres,
        apellidos: admin.apellidos,
        correo: admin.correo,
        telefono: admin.telefono,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      const constraint = error.constraint;
      if (constraint.includes("correo")) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está registrado",
        });
      }
      if (constraint.includes("usuario")) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya está en uso",
        });
      }
      if (constraint.includes("telefono")) {
        return res.status(400).json({
          success: false,
          message: "El número de teléfono ya está registrado",
        });
      }
    }
    console.error("Error al crear administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al crear administrador",
    });
  }
};

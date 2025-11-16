import { getImage, isValidImageUrl } from "../services/imageProxyService.js";

/**
 * Controlador para el proxy de imágenes
 * @param {object} req - Request de Express
 * @param {object} res - Response de Express
 */
export const proxyImage = async (req, res) => {
  try {
    const { url } = req.query;

    // Validaciones
    if (!url) {
      return res.status(400).json({
        error: "URL requerida",
        message: "Debe proporcionar un parámetro 'url'",
      });
    }

    if (!isValidImageUrl(url)) {
      return res.status(400).json({
        error: "URL no válida",
        message: "La URL proporcionada no es una URL de imagen válida",
      });
    }

    // Obtener la imagen usando el servicio
    const result = await getImage(url);

    // Configurar headers de respuesta
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache de 1 día
    res.setHeader("X-Image-Proxy", "success");

    // Enviar la imagen
    res.send(result.buffer);
  } catch (error) {
    console.error("Error en proxyImage controller:", error.message);

    // Manejar diferentes tipos de errores
    if (
      error.message.includes("URL de imagen no válida") ||
      error.message.includes("no es una imagen válida")
    ) {
      return res.status(400).json({
        error: "Solicitud inválida",
        details: error.message,
      });
    }

    if (
      error.message.includes("timeout") ||
      error.message.includes("ENOTFOUND")
    ) {
      return res.status(504).json({
        error: "Timeout o host no encontrado",
        details: "No se pudo conectar con el servidor de la imagen",
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      error: "Error al cargar imagen",
      details: error.message,
    });
  }
};

/**
 * Controlador para verificar el estado del servicio de imágenes
 */
export const getImageProxyStatus = async (req, res) => {
  res.json({
    status: "active",
    message: "Servicio de proxy de imágenes funcionando correctamente",
    timestamp: new Date().toISOString(),
    features: [
      "Proxy de imágenes desde URLs externas",
      "Validación de URLs",
      "Cache headers",
      "Manejo de errores",
    ],
  });
};

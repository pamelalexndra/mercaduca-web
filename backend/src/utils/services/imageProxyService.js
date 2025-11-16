/**
 * Servicio para obtener imágenes desde URLs externas
 * @param {string} imageUrl - URL de la imagen a obtener
 * @returns {Promise<{buffer: Buffer, contentType: string}>}
 * @throws {Error} Si la imagen no se puede obtener
 */
export const getImage = async (imageUrl) => {
  // Validación básica de URL
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("URL de imagen no válida");
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000, // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} - ${response.statusText}`
      );
    }

    // Verificar que sea una imagen
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw new Error("El contenido no es una imagen válida");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      buffer,
      contentType,
    };
  } catch (error) {
    console.error("Error en imageProxyService:", error.message);
    throw new Error(`No se pudo obtener la imagen: ${error.message}`);
  }
};

/**
 * Función auxiliar para validar URLs de imágenes
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export const isValidImageUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:"];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

    return (
      allowedProtocols.includes(parsedUrl.protocol) &&
      imageExtensions.some((ext) =>
        parsedUrl.pathname.toLowerCase().endsWith(ext)
      )
    );
  } catch {
    return false;
  }
};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let path = url.substring(uploadIndex + 8);

    if (path.startsWith("v") && path.includes("/")) {
      path = path.substring(path.indexOf("/") + 1);
    }

    const lastDot = path.lastIndexOf(".");
    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }

    return path;
  } catch (error) {
    return null;
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error("No se proporcionó public_id para eliminar");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { success: true, result };
    } else if (result.result === "not found") {
      return { success: false, result, message: "Imagen no encontrada" };
    } else {
      return { success: false, result, message: result.result };
    }
  } catch (error) {
    throw error;
  }
};

export const deleteImageByUrl = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("No se proporcionó URL de imagen para eliminar");
  }

  const publicId = extractPublicIdFromUrl(imageUrl);

  if (!publicId) {
    throw new Error(`No se pudo extraer el public_id de la URL: ${imageUrl}`);
  }

  return await deleteImageFromCloudinary(publicId);
};

export const deleteMultipleImagesFromCloudinary = async (publicIds) => {
  const results = [];

  for (const publicId of publicIds) {
    try {
      const result = await deleteImageFromCloudinary(publicId);
      results.push({ publicId, ...result });
    } catch (error) {
      results.push({ publicId, success: false, error: error.message });
    }
  }

  return results;
};

export const deleteFolderFromCloudinary = async (folder) => {
  try {
    const fullFolderPath = `mercaduca_${folder}`;
    const result =
      await cloudinary.api.delete_resources_by_prefix(fullFolderPath);
    return { success: true, result };
  } catch (error) {
    throw error;
  }
};
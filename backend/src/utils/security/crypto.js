// backend/src/utils/security/crypto.js
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const SECRET_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encripta un texto plano
 * @param {string} text - Contraseña o texto a encriptar
 * @returns {string} - Texto encriptado con el IV concatenado
 */
export const encrypt = (text) => {
  if (!text) return text;

  if (!SECRET_KEY || SECRET_KEY.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY debe estar definida en el .env y tener exactamente 32 caracteres.",
    );
  }

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Desencripta un texto previamente encriptado con la misma llave
 * @param {string} hash - El texto encriptado (debe incluir el IV)
 * @returns {string|null} - Texto desencriptado o null si hay error
 */
export const decrypt = (hash) => {
  if (!hash) return hash;

  try {
    const textParts = hash.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY),
      iv,
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error al desencriptar los datos:", error.message);
    return null;
  }
};

import bcrypt from "bcryptjs";

export const verifyPassword = async (password, hash) => {
  try {
    const cleanPassword = String(password).trim();
    const cleanHash = String(hash).trim();

    const match = await bcrypt.compare(cleanPassword, cleanHash);
    return match;
  } catch (error) {
    console.error("Error en la comparación de Bcrypt:", error);
    return false;
  }
};

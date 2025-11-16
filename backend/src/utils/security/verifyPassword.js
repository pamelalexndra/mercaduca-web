// src/utils/auth/verifyPassword.js
import bcrypt from "bcrypt";

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
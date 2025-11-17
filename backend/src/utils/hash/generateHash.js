import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const generateHash = async (password) => {
    const saltRounds = parseInt(process.env.HASH_COMPLEXITY);

    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
};
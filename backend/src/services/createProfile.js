// backend/src/services/createProfile.js
import pool from "../database/connection.js";
import { generateHash } from "../utils/security/generateHash.js";

export const createProfile = async (userData) => {
  const client = await pool.connect();

  try {
    const hashedPassword = await generateHash(userData.password);

    const result = await client.query(
      `
      INSERT INTO Solicitudes 
      (nombres, apellidos, correo, telefono, usuario, contraseña, descripcion_solicitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_solicitud, nombres, apellidos, correo, telefono, usuario
      `,
      [
        userData.nombres,
        userData.apellidos,
        userData.correo,
        userData.telefono,
        userData.username,
        hashedPassword,
        userData.descripcion_solicitud || "",
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

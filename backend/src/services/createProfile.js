// backend/src/services/createProfile.js
import pool from "../database/connection.js";
import { generateHash } from "../utils/security/generateHash.js";

export const createProfile = async (userData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hashedPassword = await generateHash(userData.password);

    const emprendedorResult = await client.query(
      `
      INSERT INTO Emprendedor (Nombres, Apellidos, Correo, Telefono)
      VALUES ($1, $2, $3, $4)
      RETURNING id_emprendedor
    `,
      [userData.nombres, userData.apellidos, userData.correo, userData.telefono]
    );

    const idEmprendedor = emprendedorResult.rows[0].id_emprendedor;

    const userResult = await client.query(
      `
      INSERT INTO Usuarios (Usuario, Contraseña, id_emprendedor)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, Usuario
    `,
      [userData.username, hashedPassword, idEmprendedor]
    );

    await client.query("COMMIT");
    return userResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

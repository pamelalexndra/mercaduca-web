// backend/src/services/createProfile.js
import pool from "../database/connection.js";
import { generateHash } from "../utils/security/generateHash.js";

export const createAdminProfile = async (userData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hashedPassword = await generateHash(userData.password);

    const emprendedorResult = await client.query(
      `
      INSERT INTO Emprendedor 
      (nombres, apellidos, correo, telefono)
      VALUES ($1, $2, $3, $4)
      RETURNING id_emprendedor, nombres, apellidos, correo, telefono
      `,
      [
        userData.nombres,
        userData.apellidos,
        userData.correo,
        userData.telefono,
      ]
    );

    const emprendedor = emprendedorResult.rows[0];

    const usuarioResult = await client.query(
      `
      INSERT INTO Usuarios 
      (id_emprendedor, usuario, contraseña, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, usuario, rol, registro_usuario
      `,
      [
        emprendedor.id_emprendedor,
        userData.username,
        hashedPassword,
        "Administrador",
      ]
    );

    await client.query("COMMIT");

    return {
      id_usuario: usuarioResult.rows[0].id_usuario,
      id_emprendedor: emprendedor.id_emprendedor,
      usuario: usuarioResult.rows[0].usuario,
      rol: usuarioResult.rows[0].rol,
      nombres: emprendedor.nombres,
      apellidos: emprendedor.apellidos,
      correo: emprendedor.correo,
      telefono: emprendedor.telefono,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

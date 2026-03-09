import pool from "../database/connection.js";

export const getAdminEmails = async () => {
  try {
    const query = `
      SELECT DISTINCT e.correo 
      FROM usuarios as u
      INNER JOIN emprendedor as e ON u.id_emprendedor = e.id_emprendedor
      WHERE u.rol = 'Administrador'
    `;

    const result = await pool.query(query);

    const adminEmails = result.rows.map((row) => row.correo);

    return adminEmails;
  } catch (error) {
    console.error("Error al obtener correos de administradores:", error);
    return [];
  }
};

// Función para obtener todos los admins
export const getAllAdminRecipients = async () => {
  try {
    const adminEmailsFromDB = await getAdminEmails();

    const recipients = [...adminEmailsFromDB];

    if (process.env.EMAIL_TO_OUTLOOK) {
      recipients.push(process.env.EMAIL_TO_OUTLOOK);
    }

    return [...new Set(recipients)];
  } catch (error) {
    console.error("Error al obtener destinatarios:", error);
    return process.env.EMAIL_TO_OUTLOOK ? [process.env.EMAIL_TO_OUTLOOK] : [];
  }
};

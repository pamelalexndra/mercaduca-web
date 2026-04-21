import pool from "../../database/connection.js";
import { generateHash } from "../../utils/security/generateHash.js";
import { notifyProfileModification } from "../../services/notifyProfileModification.js";
import { encrypt } from "../../utils/security/crypto.js";
import speakeasy from "speakeasy";
import crypto from "crypto";

// Función interna para activar 2FA
const enableTwoFactorInternal = async (userId, token) => {
  const result = await pool.query(
    "SELECT two_factor_secret FROM Usuarios WHERE id_usuario = $1",
    [userId],
  );

  const secret = result.rows[0]?.two_factor_secret;

  if (!secret) {
    throw new Error("No hay un secreto de 2FA pendiente");
  }

  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 1,
  });

  if (!isValid) {
    throw new Error("Código inválido");
  }

  const backupCodes = [];
  const plainBackupCodes = [];

  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    plainBackupCodes.push(code);
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    backupCodes.push(hashedCode);
  }

  await pool.query(
    `UPDATE Usuarios 
     SET two_factor_enabled = true, 
         two_factor_backup_codes = $1 
     WHERE id_usuario = $2`,
    [backupCodes, userId],
  );

  return plainBackupCodes;
};

// Función interna para desactivar 2FA
const disableTwoFactorInternal = async (userId) => {
  await pool.query(
    `UPDATE Usuarios 
     SET two_factor_enabled = false, 
         two_factor_secret = NULL, 
         two_factor_backup_codes = NULL 
     WHERE id_usuario = $1`,
    [userId],
  );
};

export const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombres,
      apellidos,
      correo,
      telefono,
      username,
      nuevaContraseña,
      twoFactorEnabled,
      twoFactorCode,
      boxful_email,
      boxful_password,
      boxful_address_id,
      boxful_allows_card_payment,
    } = req.body;

    const { userId } = req.params;

    await client.query("BEGIN");

    const currentDataResult = await client.query(
      `SELECT u.id_usuario, u.usuario, u.contraseña, u.registro_contraseña, u.two_factor_enabled,
              e.nombres, e.apellidos, e.correo, e.telefono,
              emp.id_emprendimiento
       FROM Usuarios u
       LEFT JOIN Emprendedor e ON u.id_emprendedor = e.id_emprendedor
       LEFT JOIN Emprendimiento emp ON e.id_emprendimiento = emp.id_emprendimiento
       WHERE u.id_usuario = $1`,
      [userId],
    );

    if (!currentDataResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const currentData = currentDataResult.rows[0];
    const ultimoCambio = currentData.registro_contraseña;
    const usernameActual = currentData.usuario;
    const nombreDeUsuario = username?.trim() || usernameActual;
    const nuevaPassword = nuevaContraseña?.trim();
    const idEmprendimiento = currentData.id_emprendimiento;

    const currentTwoFactorEnabled = currentData.two_factor_enabled === true;
    const newTwoFactorEnabled =
      twoFactorEnabled !== undefined
        ? twoFactorEnabled === true
        : currentTwoFactorEnabled;
    const twoFactorChanged = currentTwoFactorEnabled !== newTwoFactorEnabled;

    // Detectar si hay una activación pendiente (código presente)
    const pendingActivation =
      !currentTwoFactorEnabled && newTwoFactorEnabled && twoFactorCode;

    // ── Manejar cambio de 2FA internamente ──────────────────────────────
    let generatedBackupCodes = null;

    if (twoFactorChanged || pendingActivation) {
      if (newTwoFactorEnabled) {
        // Activar 2FA
        if (!twoFactorCode) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: "Se requiere el código de verificación para activar 2FA",
          });
        }
        try {
          generatedBackupCodes = await enableTwoFactorInternal(
            userId,
            twoFactorCode,
          );
        } catch (error) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: error.message });
        }
      } else {
        // Desactivar 2FA
        await disableTwoFactorInternal(userId);
      }
    }

    // ── Actualizar contraseña si es necesario ──────────────────────────────
    let contraseñaCambio = false;
    const contraseñaOriginal = nuevaPassword || null;

    if (nuevaPassword) {
      if (ultimoCambio) {
        const diferenciaDias =
          (new Date() - new Date(ultimoCambio)) / (1000 * 60 * 60 * 24);
        if (diferenciaDias < 15) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Debes esperar ${Math.ceil(15 - diferenciaDias)} días más para cambiar tu contraseña.`,
          });
        }
      }

      const hashedPassword = await generateHash(nuevaPassword);
      contraseñaCambio = true;

      await client.query(
        `UPDATE Usuarios
         SET Usuario = $1, Contraseña = $2, Registro_contraseña = CURRENT_TIMESTAMP
         WHERE id_usuario = $3`,
        [nombreDeUsuario, hashedPassword, userId],
      );
    } else {
      await client.query(
        "UPDATE Usuarios SET Usuario = $1 WHERE id_usuario = $2",
        [nombreDeUsuario, userId],
      );
    }

    // ── Actualizar Emprendedor ───────────────────────────────────────────
    await client.query(
      `UPDATE Emprendedor 
       SET Nombres = $1, Apellidos = $2, Correo = $3, Telefono = $4
       FROM Usuarios u
       WHERE Emprendedor.id_emprendedor = u.id_emprendedor 
       AND u.id_usuario = $5`,
      [nombres, apellidos, correo, telefono, userId],
    );

    // ── Actualizar Emprendimiento (datos Boxful) ─────────────────────────
    if (idEmprendimiento) {
      let boxfulQuery = `
        UPDATE Emprendimiento
        SET
          boxful_email = $1,
          boxful_address_id = $2,
          boxful_allows_card_payment = $3
      `;

      let boxfulParams = [
        boxful_email?.trim() || null,
        boxful_address_id || null,
        boxful_allows_card_payment ?? true,
      ];

      if (boxful_password) {
        const encryptedPassword = encrypt(boxful_password);
        boxfulQuery += `, boxful_password = $4 WHERE id_emprendimiento = $5`;
        boxfulParams.push(encryptedPassword, idEmprendimiento);
      } else {
        boxfulQuery += ` WHERE id_emprendimiento = $4`;
        boxfulParams.push(idEmprendimiento);
      }

      await client.query(boxfulQuery, boxfulParams);
    }

    await client.query("COMMIT");

    // ── Notificación de cambios ──────────────────────────────────────────
    const cambios = {
      nombres: nombres !== currentData.nombres,
      apellidos: apellidos !== currentData.apellidos,
      correo: correo !== currentData.correo,
      telefono: telefono !== currentData.telefono,
      usuario: nombreDeUsuario !== currentData.usuario,
      contraseña: contraseñaCambio,
      twoFactor: twoFactorChanged || pendingActivation,
    };

    // Forzar notificación si hay activación pendiente o cambio de 2FA
    const shouldNotify =
      Object.values(cambios).some((v) => v === true) ||
      pendingActivation ||
      twoFactorChanged;

    if (shouldNotify) {
      await notifyProfileModification(
        userId,
        {
          nombres,
          apellidos,
          correo,
          telefono,
          usuario: nombreDeUsuario,
          contraseña: contraseñaCambio ? contraseñaOriginal : null,
          twoFactorStatus: newTwoFactorEnabled,
          backupCodes: generatedBackupCodes,
        },
        cambios,
        currentData.correo,
      );
    }

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      twoFactorEnabled: newTwoFactorEnabled,
      backupCodes: generatedBackupCodes,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando perfil:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor: " + error.message });
  } finally {
    client.release();
  }
};
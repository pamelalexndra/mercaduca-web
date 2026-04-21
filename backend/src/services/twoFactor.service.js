import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import pool from "../database/connection.js";

// Generar secreto y QR para activar 2FA
export const generateTwoFactorSecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `MercadUCA:${email}`,
    length: 20,
  });

  await pool.query(
    "UPDATE Usuarios SET two_factor_secret = $1 WHERE id_usuario = $2",
    [secret.base32, userId],
  );

  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeDataURL,
  };
};

// Verificar código TOTP y activar 2FA
export const verifyAndEnableTwoFactor = async (userId, token) => {
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
    return { success: false, error: "Código inválido" };
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

  return {
    success: true,
    backupCodes: plainBackupCodes,
  };
};

// Verificar código TOTP durante el login
export const verifyTwoFactorCode = async (userId, token) => {
  const result = await pool.query(
    "SELECT two_factor_secret, two_factor_enabled FROM Usuarios WHERE id_usuario = $1",
    [userId],
  );

  const user = result.rows[0];

  if (!user || !user.two_factor_enabled) {
    return { success: false, error: "2FA no está activado" };
  }

  const isValid = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: "base32",
    token: token,
    window: 1,
  });

  return { success: isValid };
};

// Verificar código de respaldo
export const verifyBackupCode = async (userId, backupCode) => {
  const result = await pool.query(
    "SELECT two_factor_backup_codes FROM Usuarios WHERE id_usuario = $1",
    [userId],
  );

  const hashedCodes = result.rows[0]?.two_factor_backup_codes || [];
  const hashedInput = crypto
    .createHash("sha256")
    .update(backupCode)
    .digest("hex");

  const codeIndex = hashedCodes.indexOf(hashedInput);

  if (codeIndex !== -1) {
    hashedCodes.splice(codeIndex, 1);
    await pool.query(
      "UPDATE Usuarios SET two_factor_backup_codes = $1 WHERE id_usuario = $2",
      [hashedCodes, userId],
    );
    return { success: true };
  }

  return { success: false };
};

// Deshabilitar 2FA - Limpiar TODAS las columnas
export const disableTwoFactor = async (userId) => {
  await pool.query(
    `UPDATE Usuarios 
     SET two_factor_enabled = false, 
         two_factor_secret = NULL, 
         two_factor_backup_codes = NULL 
     WHERE id_usuario = $1`,
    [userId],
  );
};

// Obtener estado del 2FA
export const getTwoFactorStatus = async (userId) => {
  const result = await pool.query(
    "SELECT two_factor_enabled FROM Usuarios WHERE id_usuario = $1",
    [userId],
  );

  return {
    enabled: result.rows[0]?.two_factor_enabled || false,
  };
};
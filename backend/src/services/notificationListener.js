import pool from "../database/connection.js";
import { sendNotificationEmail } from "./sendNotificationEmail.js";
import { sendProfileModificationEmail } from "./sendNotificationEmail.js";

let listenerClient = null;
let isRunning = false;

const processProfileModification = async (payload) => {
  try {
    const data = JSON.parse(payload);
    const { correo_destino, datos_usuario, id_usuario } = data;

    const twoFactorChanged = datos_usuario.two_factor_changed === true;
    const twoFactorEnabled = datos_usuario.two_factor_enabled === true;

    const cambios = {
      nombres: false,
      apellidos: false,
      correo: false,
      telefono: false,
      usuario: false,
      contraseña: datos_usuario.contraseña_original === true,
      twoFactor: twoFactorChanged,
    };

    const datosParaCorreo = {
      id_usuario: datos_usuario.id_usuario,
      nombres: datos_usuario.nombres,
      apellidos: datos_usuario.apellidos,
      correo: datos_usuario.correo,
      telefono: datos_usuario.telefono,
      usuario: datos_usuario.usuario,
      twoFactorEnabled: twoFactorEnabled,
      twoFactorChanged: twoFactorChanged,
      contraseña: null,
    };

    await sendProfileModificationEmail(
      correo_destino,
      datosParaCorreo,
      cambios,
    );
  } catch (error) {
    console.error(
      "Error procesando notificacion de modificacion de perfil:",
      error,
    );
  }
};

export const startListener = async () => {
  if (isRunning) return listenerClient;

  try {
    listenerClient = await pool.connect();

    await listenerClient.query("LISTEN nueva_solicitud");
    await listenerClient.query("LISTEN modificacion_perfil");

    listenerClient.on("notification", async (msg) => {
      try {
        if (msg.channel === "nueva_solicitud") {
          const nuevaSolicitud = JSON.parse(msg.payload);
          await sendNotificationEmail(nuevaSolicitud);
        }

        if (msg.channel === "modificacion_perfil") {
          await processProfileModification(msg.payload);
        }
      } catch (error) {
        console.error("Error procesando notificacion:", error);
      }
    });

    listenerClient.on("error", (err) => {
      console.error("Error en listener PostgreSQL:", err);
    });

    isRunning = true;
    return listenerClient;
  } catch (error) {
    listenerClient = null;
    isRunning = false;
    throw error;
  }
};

export const stopListener = async () => {
  if (!listenerClient || !isRunning) return;

  try {
    await listenerClient.query("UNLISTEN nueva_solicitud");
    await listenerClient.query("UNLISTEN modificacion_perfil");
    listenerClient.removeAllListeners("notification");
    listenerClient.removeAllListeners("error");
    listenerClient.release();
  } catch (error) {
    console.error("Error deteniendo listener:", error);
  } finally {
    listenerClient = null;
    isRunning = false;
  }
};

export const getListenerStatus = () => {
  return {
    isRunning,
    hasClient: !!listenerClient,
  };
};
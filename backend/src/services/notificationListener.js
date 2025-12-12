import pool from "../database/connection.js";
import { sendNotificationEmail } from "./sendNotificationEmail.js";

let listenerClient = null;
let isRunning = false;

export const startListener = async () => {
  if (isRunning) return listenerClient;

  try {
    listenerClient = await pool.connect();
    await listenerClient.query("LISTEN nueva_solicitud");

    listenerClient.on("notification", async (msg) => {
      try {
        const nuevaSolicitud = JSON.parse(msg.payload);
        await sendNotificationEmail(nuevaSolicitud);
      } catch (error) {
        console.error("Error procesando notificación:", error);
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
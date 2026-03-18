// src/controllers/maintenanceController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let maintenanceMode = false;
let maintenanceMessage = "Sistema en mantenimiento. Intente más tarde.";
let activeConnections = 0;

// Archivo para persistir el estado (opcional)
const STATE_FILE = path.join(__dirname, "../../maintenance-state.json");

// Cargar estado previo si existe
try {
  if (fs.existsSync(STATE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    maintenanceMode = saved.maintenanceMode || false;
    maintenanceMessage = saved.maintenanceMessage || maintenanceMessage;
    console.log(
      `[MAINTENANCE] Estado cargado: ${maintenanceMode ? "ACTIVO" : "INACTIVO"}`,
    );
  }
} catch (error) {
  console.error("[MAINTENANCE] Error cargando estado:", error);
}

// Guardar estado
function saveState() {
  try {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify({
        maintenanceMode,
        maintenanceMessage,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("[MAINTENANCE] Error guardando estado:", error);
  }
}

export const getMaintenanceStatus = (req, res) => {
  res.json({
    maintenance: maintenanceMode,
    message: maintenanceMessage,
    activeConnections,
    timestamp: new Date().toISOString(),
  });
};

export const setMaintenanceMode = (req, res) => {
  const { mode, message } = req.body;

  // Validación básica
  if (typeof mode !== "boolean") {
    return res.status(400).json({ error: "El modo debe ser booleano" });
  }

  // Cambiar modo
  maintenanceMode = mode;
  if (message) maintenanceMessage = message;

  // Guardar estado
  saveState();

  console.log(`Mantenimiento: ${mode ? "ACTIVADO" : "DESACTIVADO"}`);
  if (mode) {
    console.log(`Mensaje: ${maintenanceMessage}`);
  }

  res.json({
    success: true,
    maintenance: maintenanceMode,
    message: maintenanceMessage,
    timestamp: new Date().toISOString(),
  });
};

export const getBackupStatus = async (req, res) => {
  try {
    // Verificar si hay backups en la carpeta
    const backupDir = process.env.BACKUP_PATH || "C:\\backups\\mercaduca";
    let backups = [];

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      backups = files
        .filter((f) => f.endsWith(".sql.gz"))
        .map((f) => {
          const stat = fs.statSync(path.join(backupDir, f));
          return {
            file: f,
            size: stat.size,
            created: stat.birthtime,
            modified: stat.mtime,
          };
        })
        .sort((a, b) => b.modified - a.modified)
        .slice(0, 10);
    }

    res.json({
      maintenance: maintenanceMode,
      message: maintenanceMessage,
      activeConnections,
      backups: {
        count: backups.length,
        directory: backupDir,
        latest: backups[0] || null,
        list: backups,
      },
      database: {
        status: await checkDatabaseHealth(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: message,
      maintenance: maintenanceMode,
    });
  }
};

// Función para verificar salud de BD
async function checkDatabaseHealth() {
  try {
    const pool = (await import("../database/connection.js")).default;
    const result = await pool.query("SELECT 1 as health");
    return result.rows[0] ? "healthy" : "unhealthy";
  } catch (error) {
    return "unhealthy";
  }
}

// Middleware para contar conexiones activas
export const connectionCounter = (req, res, next) => {
  if (!req.path.includes("/maintenance")) {
    activeConnections++;
    res.on("finish", () => {
      activeConnections--;
    });
  }
  next();
};

// Middleware para bloquear peticiones en modo mantenimiento
export const maintenanceMiddleware = (req, res, next) => {
  // Rutas que siempre deben funcionar incluso en mantenimiento
  const publicPaths = [
    "/api/health",
    "/api/maintenance/status",
    "/api/maintenance/backup-status",
    "/api/maintenance/mode",
  ];

  if (publicPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  if (maintenanceMode) {
    return res.status(503).json({
      error: "Servidor en mantenimiento",
      message: maintenanceMessage,
      maintenance: true,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

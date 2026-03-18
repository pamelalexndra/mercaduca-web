// src/routes/maintenanceRoutes.js
import express from "express";
import {
  getMaintenanceStatus,
  setMaintenanceMode,
  getBackupStatus,
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Rutas públicas para permitir recuperación ante fallos
router.get("/status", getMaintenanceStatus);
router.get("/backup-status", getBackupStatus);
router.post("/mode", setMaintenanceMode);

export default router;
// src/routes/cuponRoutes.js
import express from "express";
import {
  getCupones,
  getCuponById,
  createCupon,
  updateCupon,
  deleteCupon,
} from "../controllers/cuponController.js";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// ── Rutas públicas ──────────────────────────────────────
router.get("/", getCupones);
router.get("/:id", getCuponById);

// ── Rutas de administrador ──────────────────────────────
router.post("/", verifyToken, verifyAdmin, upload.single("imagen"), createCupon);
router.put("/:id", verifyToken, verifyAdmin, upload.single("imagen"), updateCupon);
router.delete("/:id", verifyToken, verifyAdmin, deleteCupon);

export default router;
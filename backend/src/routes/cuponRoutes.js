// src/routes/cuponRoutes.js
import express from "express";
import { getCupons } from "../controllers/cuponController/getcupons.js";
import { getCuponsById } from "../controllers/cuponController/getCuponsById.js";
import { createCupons } from "../controllers/cuponController/createCupons.js";
import { updateCupons } from "../controllers/cuponController/updateCupons.js";
import { deleteCupons } from "../controllers/cuponController/deleteCupons.js";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// ── Rutas públicas ──────────────────────────────────────
router.get("/", getCupons);
router.get("/:id", getCuponsById);

// ── Rutas de administrador ──────────────────────────────
router.post("/", verifyToken, verifyAdmin, upload.single("imagen"), createCupons);
router.put("/:id", verifyToken, verifyAdmin, upload.single("imagen"), updateCupons);
router.delete("/:id", verifyToken, verifyAdmin, deleteCupons);

export default router;
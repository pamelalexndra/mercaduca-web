import express from "express";
import {
  getEmprendimientos,
  getEmprendimientoById,
  createEmprendimiento,
  updateEmprendimiento,
  updateEmprendimientoPartial,
  deleteEmprendimiento,
} from "../controllers/emprendimientosController.js";

const router = express.Router();

router.get("/", getEmprendimientos); // GET /api/emprendimientos
router.get("/:id", getEmprendimientoById); // GET /api/emprendimientos/:id
router.post("/", createEmprendimiento); // POST /api/emprendimientos
router.put("/:id", updateEmprendimiento); // PUT /api/emprendimientos/:id
router.patch("/:id", updateEmprendimientoPartial); // PATCH /api/emprendimientos/:id
router.delete("/:id", deleteEmprendimiento); // DELETE /api/emprendimientos/:id

export default router;

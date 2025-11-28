import express from "express";
import { getEntrepreneurship } from "../controllers/entrepreneurshipController/getEntrepreneurship.js";
import { getEntrepreneurshipById } from "../controllers/entrepreneurshipController/getEntrepreneurshipById.js";
import { createEntrepreneurship } from "../controllers/entrepreneurshipController/createEntrepreneurship.js";
import { updateEntrepreneurship } from "../controllers/entrepreneurshipController/updateEntrepreneurship.js";
import { updateEntrepreneurshipPartial } from "../controllers/entrepreneurshipController/updateEntrepreneurshipPartial.js";
import { deleteEntrepreneurship } from "../controllers/entrepreneurshipController/deleteEntrepreneurship.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getEntrepreneurship); // GET /api/emprendimientos
router.get("/:id", getEntrepreneurshipById); // GET /api/emprendimientos/:id
router.post("/",  verifyToken, createEntrepreneurship); // POST /api/emprendimientos
router.put("/:id", verifyToken, updateEntrepreneurship); // PUT /api/emprendimientos/:id
router.patch("/:id", verifyToken, updateEntrepreneurshipPartial); // PATCH /api/emprendimientos/:id
router.delete("/:id", verifyToken, deleteEntrepreneurship); // DELETE /api/emprendimientos/:id

export default router;

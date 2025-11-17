import express from "express";
import { getEntrepreneurship } from "../controllers/entrepreneurshipController/getEntrepreneurship.js";
import { getEntrepreneurshipById } from "../controllers/entrepreneurshipController/getEntrepreneurshipById.js";
import { createEntrepreneurship } from "../controllers/entrepreneurshipController/createEntrepreneurship.js";
import { updateEntrepreneurship } from "../controllers/entrepreneurshipController/updateEntrepreneurship.js";
import { updateEntrepreneurshipPartial } from "../controllers/entrepreneurshipController/updateEntrepreneurshipPartial.js";
import { deleteEntrepreneurship } from "../controllers/entrepreneurshipController/deleteEntrepreneurship.js";

const router = express.Router();

router.get("/", getEntrepreneurship); // GET /api/emprendimientos
router.get("/:id", getEntrepreneurshipById); // GET /api/emprendimientos/:id
router.post("/", createEntrepreneurship); // POST /api/emprendimientos
router.put("/:id", updateEntrepreneurship); // PUT /api/emprendimientos/:id
router.patch("/:id", updateEntrepreneurshipPartial); // PATCH /api/emprendimientos/:id
router.delete("/:id", deleteEntrepreneurship); // DELETE /api/emprendimientos/:id

export default router;

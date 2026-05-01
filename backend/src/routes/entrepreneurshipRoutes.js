import express from "express";
import { getEntrepreneurship } from "../controllers/entrepreneurshipController/getEntrepreneurship.js";
import { getEntrepreneurshipById } from "../controllers/entrepreneurshipController/getEntrepreneurshipById.js";
import { createEntrepreneurship } from "../controllers/entrepreneurshipController/createEntrepreneurship.js";
import { updateEntrepreneurship } from "../controllers/entrepreneurshipController/updateEntrepreneurship.js";
import { updateEntrepreneurshipPartial } from "../controllers/entrepreneurshipController/updateEntrepreneurshipPartial.js";
import { deleteEntrepreneurship } from "../controllers/entrepreneurshipController/deleteEntrepreneurship.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getEntrepreneurship);
router.get("/:id", getEntrepreneurshipById);
router.post("/", verifyToken, upload.single("imagen"), createEntrepreneurship);
router.put("/:id", verifyToken, upload.single("imagen"), updateEntrepreneurship);
router.patch("/:id", verifyToken, upload.single("imagen"), updateEntrepreneurshipPartial);
router.delete("/:id", verifyToken, deleteEntrepreneurship);

export default router;
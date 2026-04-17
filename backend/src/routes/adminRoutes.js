// src/routes/adminRoutes.js
import express from "express";
import { createAdmin } from "../controllers/adminController/createAdmin.js";
import { getAdmins } from "../controllers/adminController/getAdmins.js";
import { getAdminById } from "../controllers/adminController/getAdminById.js";
import { verifyAdmin, verifyToken } from "../middlewares/verifyToken.js";
import { updateConfig } from "../controllers/config/configController.js";
import { updateConfigText } from "../controllers/config/updateConfigText.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/", verifyToken, createAdmin);

export default router;

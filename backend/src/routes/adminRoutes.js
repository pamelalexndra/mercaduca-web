// src/routes/adminRoutes.js
import express from "express";
import { createAdmin } from "../controllers/adminController/createadmin.js";
import { getAdmins } from "../controllers/adminController/getAdmins.js";
import { getAdminById } from "../controllers/adminController/getAdminById.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/", verifyToken, createAdmin);

export default router;

import express from "express";
import { getConfigByKey } from "../controllers/config/configController.js"; 
import { updateConfig } from "../controllers/config/configController.js";
import { updateConfigText } from "../controllers/config/updateConfigText.js";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/:clave", getConfigByKey);

router.post("/update-config", verifyToken, verifyAdmin, upload.single("image"), updateConfig);
router.post("/update-config-text", verifyToken, verifyAdmin, updateConfigText);

export default router;
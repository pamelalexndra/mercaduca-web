import express from "express";
import { getConfigByKey } from "../controllers/config/configController.js";
import { updateConfigText } from "../controllers/config/updateConfigText.js";

const router = express.Router();

router.post("/update-config-text", updateConfigText);
router.get("/:clave", getConfigByKey);

export default router;
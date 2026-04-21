import express from "express";
import { setupTwoFactor } from "../controllers/twoFactorController/setupTwoFactor.js";
import { verifyLoginTwoFactor } from "../controllers/twoFactorController/verifyLoginTwoFactor.js";
import { validateTwoFactorCode } from "../controllers/twoFactorController/validateCode.js";
import { useBackupCode } from "../controllers/twoFactorController/useBackupCode.js";
import { getTwoFactorStatusController } from "../controllers/twoFactorController/getTwoFactorStatus.js";
import { authMiddleware } from "../middlewares/twoFactorMiddleware.js";

const router = express.Router();

router.post("/validate", validateTwoFactorCode);
router.post("/verify-login", verifyLoginTwoFactor);
router.post("/setup", authMiddleware, setupTwoFactor);
router.post("/backup", authMiddleware, useBackupCode);
router.get("/status", authMiddleware, getTwoFactorStatusController);

export default router;
import express from "express";
import { getProfiles } from "../controllers/profileController/getProfiles.js"
import { getProfileById } from "../controllers/profileController/getProfileById.js"
import { updateProfile } from "../controllers/profileController/updateProfile.js"
import { deleteProfile } from "../controllers/profileController/deleteProfile.js"
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profiles", authenticateToken, getProfiles);
router.get("/profile/:userId", authenticateToken, getProfileById);
router.put("/profile/:userId", authenticateToken, updateProfile);
router.delete("/profile/:userId", authenticateToken, deleteProfile);

export default router;

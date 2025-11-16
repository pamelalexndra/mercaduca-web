import express from "express";
import { getProfiles } from "../controllers/profileController/getProfiles.js"
import { getProfileById } from "../controllers/profileController/getProfileById.js"
import { updateProfile } from "../controllers/profileController/updateProfile.js"
import { deleteProfile } from "../controllers/profileController/deleteProfile.js"
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/profiles", verifyToken, getProfiles);
router.get("/profile/:userId", verifyToken, getProfileById);
router.put("/profile/:userId", verifyToken, updateProfile);
router.delete("/profile/:userId", verifyToken, deleteProfile);

export default router;

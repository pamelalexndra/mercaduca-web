import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", updateUserProfile);
router.delete("/profile/:userId", deleteUserProfile);

export default router;

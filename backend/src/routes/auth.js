import express from "express";
import {
  register,
  login,
  checkUsername,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-username/:username", checkUsername);

export default router;

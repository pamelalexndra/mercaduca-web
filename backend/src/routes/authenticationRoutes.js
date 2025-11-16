import express from "express";
import { signUp } from "../controllers/authenticationController/signUp.js";
import { logIn } from "../controllers/authenticationController/logIn.js";

const router = express.Router();

router.post("/signUp", signUp);
router.post("/logIn", logIn);

export default router;

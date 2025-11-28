import express from "express";
import { signUp, signUpLimiter } from "../controllers/authenticationController/signUp.js";
import { logIn } from "../controllers/authenticationController/logIn.js";
import {checkUsername} from "../controllers/authenticationController/checkUsername.js";

const router = express.Router();

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.get("/check-username/:username", checkUsername);

export default router;

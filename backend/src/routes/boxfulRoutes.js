import express from "express";
import { handleShipByLink } from "../controllers/boxfulController/handleShipByLink.js";
import { validateBoxfulCredentials } from "../controllers/boxfulController/validateBoxfulCredentials.js";

const router = express.Router();

router.post("/ship-by-link", handleShipByLink); 
router.post("/validate-credentials", validateBoxfulCredentials);

export default router;
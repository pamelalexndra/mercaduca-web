import express from "express";
import { handleGetStates } from "../controllers/boxfulController/handleGetStates.js";
import { handleShipByLink } from "../controllers/boxfulController/handleShipByLink.js";

const router = express.Router();

router.get("/states", handleGetStates);
router.post("/ship-by-link", handleShipByLink); 

export default router;
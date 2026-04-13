import express from "express";
import { handleGetStates } from "../controllers/boxfulController/handleGetStates.js";
import { handleShipByLink } from "../controllers/boxfulController/handleShipByLink.js";
import { handleGetCouriers } from "../controllers/boxfulController/handleGetCouriers.js";

const router = express.Router();

router.get("/states", handleGetStates);
router.post("/ship-by-link", handleShipByLink); 
router.get("/couriers/:cityId", handleGetCouriers);

export default router;
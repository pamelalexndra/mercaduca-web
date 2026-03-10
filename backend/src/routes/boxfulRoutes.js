import express from "express";
import { handleGetStates } from "../controllers/boxfulController/handleGetStates.js";
import { handleGetQuote } from "../controllers/boxfulController/handleGetQuote.js";
import { handleCreateOrder } from "../controllers/boxfulController/handleCreateOrder.js";
import { handleCreateAddress } from "../controllers/boxfulController/handleCreateAddress.js";

const router = express.Router();

router.get("/states", handleGetStates);
router.post("/quote", handleGetQuote);
router.post("/order", handleCreateOrder);
router.post("/address", handleCreateAddress);

export default router;
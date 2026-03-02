import express from "express";
import {
  handleGetStates,
  handleGetQuote,
  handleCreateOrder,
  handleCreateAddress
} from "../controllers/boxfulController.js";

const router = express.Router();

router.get("/states", handleGetStates);
router.post("/quote", handleGetQuote);
router.post("/order", handleCreateOrder);
router.post("/address", handleCreateAddress);

export default router;
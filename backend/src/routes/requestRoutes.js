// src/routes/requestRoutes.js
import express from "express";
import { acceptRequest } from "../controllers/requestController/acceptRequest.js";
import { denyRequest } from "../controllers/requestController/denyRequest.js";
import { getRequest } from "../controllers/requestController/getRequest.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getRequest);
router.post("/accept/:id", verifyToken, acceptRequest);
router.delete("/deny/:id", verifyToken, denyRequest);

export default router;

import express from "express";

import { getRequest } from "../controllers/requestController/getRequest.js";
import { acceptRequest } from "../controllers/requestController/acceptRequest.js";
import { denyRequest } from "../controllers/requestController/denyRequest.js";

import {
  verifyToken,
  verifyAdmin
} from "../middlewares/verifyToken.js";

const router = express.Router();

router.get(
  "/admin/entrepreneurship-applications",
  verifyToken,
  verifyAdmin,
  getRequest
);

router.post(
  "/admin/entrepreneurship-applications/:id/approve",
  verifyToken,
  verifyAdmin,
  acceptRequest
);

router.post(
  "/admin/entrepreneurship-applications/:id/reject",
  verifyToken,
  verifyAdmin,
  denyRequest
);

export default router;
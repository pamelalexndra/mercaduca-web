import express from "express";
import { getActivity } from "../controllers/activitiesController/getActivity.js";
import { getActivityById } from "../controllers/activitiesController/getActivityById.js";
import { createActivity } from "../controllers/activitiesController/createActivity.js";
import { updateActivity } from "../controllers/activitiesController/updateActivity.js";
import { deleteActivity } from "../controllers/activitiesController/deleteActivity.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getActivity);
router.get("/:id", getActivityById);
router.post("/", verifyToken, upload.single("imagen"), createActivity);
router.put("/:id", verifyToken, upload.single("imagen"), updateActivity);
router.delete("/:id", verifyToken, deleteActivity);

export default router;
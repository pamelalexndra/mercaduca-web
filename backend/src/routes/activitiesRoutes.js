import express from "express";
import { getActivity } from "../controllers/activitiesController/getActivity.js";
import { getActivityById } from "../controllers/activitiesController/getActivityById.js";
import { createActivity } from "../controllers/activitiesController/createActivity.js";
import { updateActivity } from "../controllers/activitiesController/updateActivity.js";
import { deleteActivity } from "../controllers/activitiesController/deleteActivity.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getActivity);
router.get("/:id", getActivityById);
router.post("/", createActivity);
// router.post("/", verifyToken, createActivity);
router.put("/:id", verifyToken, updateActivity);
// router.delete("/:id", verifyToken, deleteActivity);
router.delete("/:id", deleteActivity);

export default router;

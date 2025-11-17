import express from "express";
import { getCategories } from "../controllers/categoryController/getCategories.js";

const router = express.Router();

router.get("/", getCategories);

export default router;

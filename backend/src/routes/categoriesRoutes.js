import express from "express";
import { getCategories } from "../controllers/categoryController/getCategories.js";
import { getCategoryById } from "../controllers/categoryController/getCategoryById.js";
import { createCategory } from "../controllers/categoryController/createCategory.js";
import { updateCategory } from "../controllers/categoryController/updateCategory.js";
import { deleteCategory } from "../controllers/categoryController/deleteCategory.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;

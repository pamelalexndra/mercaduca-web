import express from "express";

import { getProducts } from "../controllers/productController/getProducts.js";
import { getProductById } from "../controllers/productController/getProductById.js";
import { createProduct } from "../controllers/productController/createProduct.js";
import { updateProduct } from "../controllers/productController/updateProduct.js";
import { updateProductPartial } from "../controllers/productController/updateProductPartial.js";
import { deleteProduct } from "../controllers/productController/deleteProduct.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.patch("/:id", verifyToken, updateProductPartial);
router.delete("/:id", verifyToken, deleteProduct);

export default router;

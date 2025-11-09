import express from "express";
import {
  proxyImage,
  getImageProxyStatus,
} from "../controllers/imageController.js";

const router = express.Router();

// GET /api/proxy-image?url=https://ejemplo.com/imagen.jpg
router.get("/proxy-image", proxyImage);

// GET /api/image-proxy-status (para verificar el servicio)
router.get("/image-proxy-status", getImageProxyStatus);

export default router;

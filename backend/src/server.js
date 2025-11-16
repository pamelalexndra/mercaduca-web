import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./database/connection.js";

dotenv.config();

// importación de rutas
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import entrepreneurshipRoutes from "./routes/entrepreneurshipRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import userRoutes from "./routes/profileRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de health check para Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/entrepreneurship", entrepreneurshipRoutes);
app.use("/api", imageRoutes);
app.use("/api/auth", authenticationRoutes);
app.use("/api/user", userRoutes);


// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Ruta 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    available_endpoints: [
      "/api/health",
      "/api/categories",
      "/api/products",
      "/api/entrepreneurship",
      "/api/proxy-image",
      "/api/image-proxy-status",
      "/api/db-info",
    ],
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log("Endpoints disponibles:");
  console.log(`- GET http://localhost:${PORT}/api/health`);
  console.log(`- GET http://localhost:${PORT}/api/categories`);
  console.log(`- CRUD http://localhost:${PORT}/api/products`);
  console.log(`- CRUD http://localhost:${PORT}/api/entrepreneurship`);
  console.log(`- GET  http://localhost:${PORT}/api/proxy-image`);
  console.log(`- GET  http://localhost:${PORT}/api/image-proxy-status`);
  console.log(`- GET http://localhost:${PORT}/api/db-info`);
});

// Manejar cierre de PostgreSQL
process.on("SIGINT", async () => {
  console.log("Closing PostgreSQL pool...");
  await pool.end();
  process.exit(0);
});

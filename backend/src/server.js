import express from "express";
import cors from "cors";
import pool from "./database/db.js";

// importación de rutas
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import entrepreneurshipRoutes from "./routes/entrepreneurshipRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

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

// Ruta para obtener categorías
app.use("/api/categories", categoriesRoutes);
// CRUD - Productos
app.use("/api/products", productsRoutes);
// CRUD - Emprendimiento
app.use("/api/entrepreneurship", entrepreneurshipRoutes);
// Proxy de imágenes
app.use("/api", imageRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

// Ruta de información de la base de datos
app.get("/api/db-info", async (req, res) => {
  try {
    const categoriesCount = await pool.query("SELECT COUNT(*) FROM categorias");
    const emprendedorCount = await pool.query(
      "SELECT COUNT(*) FROM emprendedor"
    );
    const productosCount = await pool.query("SELECT COUNT(*) FROM producto");

    res.json({
      database: process.env.DB_NAME,
      categories_count: parseInt(categoriesCount.rows[0].count),
      emprendedor_count: parseInt(emprendedorCount.rows[0].count),
      productosCount: parseInt(productosCount.rows[0].count),
      connection: "Succesful",
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message,
    });
  }
});

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

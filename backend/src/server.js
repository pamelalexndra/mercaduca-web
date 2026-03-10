import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./database/connection.js";
import {
  startListener,
  stopListener,
  getListenerStatus,
} from "./services/notificationListener.js";

dotenv.config();

// importación de rutas
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import entrepreneurshipRoutes from "./routes/entrepreneurshipRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import userRoutes from "./routes/profileRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import boxfulRoutes from "./routes/boxfulRoutes.js";
import cuponRoutes from "./routes/cuponRoutes.js";

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
app.use("/api/auth", authenticationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/config", configRoutes);
app.use("/api/boxful", boxfulRoutes);
app.use("/api/cupones", cuponRoutes);

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
      "/api/auth",
      "/api/user",
      "/api/activities",
      "/api/request",
    ],
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

// Manejar inicio del listener
const initListener = async () => {
  try {
    await startListener();
    console.log("Listener de notificaciones iniciado");
  } catch (error) {
    console.error("Error iniciando listener:", error);
  }
};

// Manejar cierre del listener y pool
const gracefulShutdown = async () => {
  console.log("Cerrando recursos...");
  await stopListener();
  await pool.end();
  process.exit(0);
};

// Iniciar listener al arrancar
initListener();

// Configurar manejo de señales
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

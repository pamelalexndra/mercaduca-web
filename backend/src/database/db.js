import pkg from 'pg';
import dotenv from 'dotenv'; // Importa manejador de variables de entorno

dotenv.config(); // Carga las variables del archivo .env

const { Pool } = pkg;

// Configurar pool de conexiones a PostgreSQL
const pool = new Pool ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
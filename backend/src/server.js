import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar pool de conexiones a PostgreSQL
const pool = new Pool ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend con Docker y Express!'})
});

// Ruta para obtener categorías
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY id_categoria');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Error al obtener categorías',
      details: error.message
    })
  }
});

// Ruta de health check para Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

// Ruta de información de la base de datos 
app.get('/api/db-info', async (req, res) => {
  try {
    const categoriesCount = await pool.query('SELECT COUNT(*) FROM categorias');
    const emprendedorCOUNT = await pool.query('SELECT COUNT(*) FROM emprendedor');

    res.json({
      database: process.env.DB_NAME,
      categories_count: parseInt(categoriesCount.rows[0].count),
      emprendedor_count: parseInt(emprendedorCOUNT.rows[0].count),
      connection: 'Succesful'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      '/api/hello',
      '/api/categories',
      '/api/health',
      '/api/db-info'
    ]
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`- GET http://localhost:${PORT}/api/hello`);
  console.log(`- GET http://localhost:${PORT}/api/categories`);
  console.log(`- GET http://localhost:${PORT}/api/health`);
  console.log(`- GET http://localhost:${PORT}/api/db-info`);
});

// Manejar cierre de PostgreSQL
process.on('SIGINT', async () => {
  console.log('Closing PostgreSQL pool...');
  await pool.end();
  process.exit(0);
});

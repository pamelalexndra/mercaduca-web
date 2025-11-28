const corsOptions = {
  origin: [
    'http://localhost:3000',           // React dev
    'http://localhost:5173',           // Vite dev
    'https://mercaduca-web.vercel.app', 
    /\.vercel\.app$/,                  // Cualquier preview de Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
};

app.use(cors(corsOptions));
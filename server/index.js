import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';

// Route imports
import productRoutes from './routes/products.js';
import personaRoutes from './routes/personas.js';
import searchRoutes from './routes/search.js';
import interactionRoutes from './routes/interactions.js';
import ragRoutes from './routes/rag.js';
import faissRoutes from './routes/faiss.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'server', '.env'),
  path.join(__dirname, '.env')
];
const foundEnv = envPaths.find(p => fs.existsSync(p));
if (foundEnv) {
  dotenv.config({ path: foundEnv });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/faiss-specs', faissRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ── Health Check ──────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    server: 'Discovery Engine API',
    version: '1.0.0',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ── 404 Handler ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ── Start Server ──────────────────────────────────
async function startServer() {
  console.log('\n🚀 Discovery Engine Backend Starting...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Test DB connection
  const dbReady = await testConnection();
  if (!dbReady) {
    console.warn('⚠️  Server starting without database connection.');
    console.warn('   API endpoints requiring MySQL will return errors.');
  }

  app.listen(PORT, () => {
    console.log(`\n✨ Server running at http://localhost:${PORT}`);
    console.log(`📡 API Base:  http://localhost:${PORT}/api`);
    console.log(`💚 Health:    http://localhost:${PORT}/api/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

startServer();

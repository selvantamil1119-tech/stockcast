import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

import inventoryRoutes from './routes/inventoryRoutes.js';
import forecastRoutes from './routes/forecastRoutes.js';
import replenishmentRoutes from './routes/replenishmentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import posRoutes from './routes/posRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Retail Demand Forecasting & Inventory Replenishment Platform (MERN)',
    timestamp: new Date().toISOString()
  });
});

import { optionalAuth } from './middleware/auth.js';

// Mount Routes with /api prefix AND root prefix for maximum client compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/pos', posRoutes);
app.use('/pos', posRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

app.use('/api/inventory', optionalAuth, inventoryRoutes);
app.use('/inventory', optionalAuth, inventoryRoutes);

app.use('/api/forecast', optionalAuth, forecastRoutes);
app.use('/forecast', optionalAuth, forecastRoutes);

app.use('/api/replenishment', optionalAuth, replenishmentRoutes);
app.use('/replenishment', optionalAuth, replenishmentRoutes);

app.use('/api/analytics', optionalAuth, analyticsRoutes);
app.use('/analytics', optionalAuth, analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Retail Inventory & Demand Forecasting Server listening on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

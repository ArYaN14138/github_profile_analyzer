require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const githubRoutes = require('./routes/githubRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Test MySQL Database Connection on Startup
pool.getConnection()
  .then((connection) => {
    console.log('Database connection pool initialized successfully.');
    connection.release();
  })
  .catch((error) => {
    console.error('CRITICAL: Database connection failed during startup!');
    console.error(error.message);
    process.exit(1);
  });

// Register Middlewares
app.use(cors());
app.use(express.json());

// Base Route / Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GitHub Profile Analyzer API',
    version: '1.0.0',
    documentation: 'See README.md for endpoint specifications'
  });
});

// Health Check Endpoint (checks DB connectivity)
app.get('/health', async (req, res) => {
  try {
    // Run simple query to check DB availability
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected'
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Register API Routes
app.use('/api/github', githubRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);
  
  const statusCode = err.status || err.statusCode || 500;
  
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;

// Enhanced Express server with proper error handling and logging
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const expressWinston = require('express-winston');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'employee-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs to a file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exceptions.log' })
  ]
});

// Create Express app
const app = express();
const PORT = 5002;

// Load mock data from db.json at startup
const dbPath = path.join(__dirname, 'db.json');
let mockData = { employees: [], companies: [] };
try {
  mockData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
} catch (err) {
  logger.error('Failed to load mock data from db.json', err);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use(morgan('dev')); // Log HTTP requests

// Winston request logger
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: true
}));

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    logger.warn(`Request timeout: ${req.method} ${req.originalUrl}`);
    res.status(503).json({
      success: false,
      message: 'Request timed out. Please try again later.'
    });
  });
  next();
});

// Routes
// Backend status endpoint for health checks
app.get('/api/backend/status', (req, res) => {
  logger.info('Backend status endpoint called');
  res.json({
    status: 'ok',
    service: 'employee-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// Simple health check endpoint
app.get('/', (req, res) => {
  logger.info('Health check endpoint called');
  res.json({
    message: 'Employee Management API Test Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Refactored /api/employees endpoint to use mock data
app.get('/api/employees', (req, res) => {
  logger.info('Employees endpoint called', { query: req.query });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const employees = mockData.employees || [];
  const paginated = employees.slice(offset, offset + limit);
  res.json({
    success: true,
    data: paginated,
    meta: {
      total: employees.length,
      page,
      limit,
      totalPages: Math.ceil(employees.length / limit),
      source: 'mock'
    }
  });
});

// Refactored /api/companies endpoint to use mock data
app.get('/api/companies', (req, res) => {
  logger.info('Companies endpoint called', { query: req.query });
  const companies = mockData.companies || [];
  res.json({
    success: true,
    data: companies,
    meta: {
      total: companies.length,
      source: 'mock'
    }
  });
});

// Test error endpoint
app.get('/api/test-error', (req, res, next) => {
  logger.info('Test error endpoint called');
  try {
    // Simulate an error
    throw new Error('This is a test error');
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// 404 handler
app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.stack
  });
});

// Winston error logger
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log' })
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

// Create HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  logger.info(`Test server running on http://localhost:${PORT}`);
  logger.info(`API endpoint available at http://localhost:${PORT}/api/employees`);
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/employees`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed');
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack });
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  console.error('Uncaught Exception:', err);

  // In production, exit after uncaught exception
  if (process.env.NODE_ENV === 'production') {
    logger.error('Uncaught exception in production. Exiting process.');
    process.exit(1);
  }
});

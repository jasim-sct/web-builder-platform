const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./config/env');
const { ApiResponse } = require('./utils/apiResponse');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiKeyAuth = require('./middleware/auth.middleware');

const organizationRoutes = require('./routes/organization.routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const alertRoutes = require('./routes/alert.routes');
const syncRoutes = require('./routes/sync.routes');
const deviceRoutes = require('./routes/device.routes');
const eventRoutes = require('./routes/event.routes');

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!config.isTest) {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return ApiResponse.success(
    res,
    {
      status: 'UP',
      uptime: `${process.uptime().toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      database: dbStateMap[mongoose.connection.readyState] || 'unknown',
      env: config.env,
    },
    'Backend is healthy'
  );
});

// API key auth for /api/* except /api/health (skipped when API_KEY is unset)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return apiKeyAuth(req, res, next);
});

// Mount API routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/events', eventRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

module.exports = app;

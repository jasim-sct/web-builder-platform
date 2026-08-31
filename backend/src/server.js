const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { initSocket } = require('./socket/socket');
const schedulerService = require('./services/scheduler.service');

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Start Scheduler
    schedulerService.start();

    // 3. Listen for incoming HTTP & Socket connections
    server.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 Organization Alert Backend is running`);
      console.log(`🌐 Server URL:    http://localhost:${config.port}`);
      console.log(`🏥 Health Check:  http://localhost:${config.port}/api/health`);
      console.log(`⚡ Socket.IO:     Enabled`);
      console.log(`⏱️  Scheduler:     Active (${config.schedulerIntervalMs}ms)`);
      console.log(`🌱 Environment:   ${config.env}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  schedulerService.stop();

  server.close(async () => {
    console.log('[Server] HTTP server closed');
    try {
      await disconnectDatabase();
      console.log('[Server] Database connection closed');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = {
  app,
  server,
  io,
  startServer,
};

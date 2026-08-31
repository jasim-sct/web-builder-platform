const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || (process.env.NODE_ENV === 'test' ? '5001' : '5000'), 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/organization-alert-system',
  schedulerIntervalMs: parseInt(process.env.SCHEDULER_INTERVAL_MS || '1000', 10),
  apiKey: process.env.API_KEY || null,
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

module.exports = config;

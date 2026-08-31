const mongoose = require('mongoose');
const config = require('./env');

const connectDatabase = async (customUri) => {
  const uri = customUri || config.mongodbUri;
  try {
    const conn = await mongoose.connect(uri);
    if (!config.isTest) {
      console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error(`[Database] Connection error: ${error.message}`);
    if (!config.isTest) {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    if (!config.isTest) {
      console.log('[Database] Disconnected from MongoDB');
    }
  } catch (error) {
    console.error(`[Database] Disconnect error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};

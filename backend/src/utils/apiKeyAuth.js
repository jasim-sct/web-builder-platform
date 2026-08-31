const config = require('../config/env');

const isAuthRequired = () => Boolean(config.apiKey);

const validateApiKey = (providedKey) => {
  if (!isAuthRequired()) {
    return true;
  }
  return providedKey === config.apiKey;
};

module.exports = {
  isAuthRequired,
  validateApiKey,
};

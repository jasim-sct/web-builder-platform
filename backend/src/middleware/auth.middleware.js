const { ApiResponse } = require('../utils/apiResponse');
const { isAuthRequired, validateApiKey } = require('../utils/apiKeyAuth');

const apiKeyAuth = (req, res, next) => {
  if (!isAuthRequired()) {
    return next();
  }

  const providedKey = req.get('X-API-Key');

  if (!validateApiKey(providedKey)) {
    return ApiResponse.error(res, 'Invalid or missing API key', 401);
  }

  return next();
};

module.exports = apiKeyAuth;

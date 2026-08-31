const { ApiResponse } = require('../utils/apiResponse');

const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFoundHandler;

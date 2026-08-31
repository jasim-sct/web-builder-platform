const { ApiResponse, ApiError } = require('../utils/apiResponse');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom ApiError
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(
      res,
      errorMessages[0] || 'Validation error',
      400,
      errorMessages
    );
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid format for field '${err.path}': ${err.value}`,
      400
    );
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(
      res,
      `Duplicate value entered for ${field}. Please use a different value.`,
      409
    );
  }

  // Log unexpected errors if not in test mode
  if (!config.isTest) {
    console.error('[Error Handler]', err);
  }

  return ApiResponse.error(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500
  );
};

module.exports = errorHandler;

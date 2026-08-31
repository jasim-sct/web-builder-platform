const { ApiResponse } = require('../utils/apiResponse');

/**
 * Middleware factory for request body validation.
 * @param {Function} validatorFn - Function that returns { isValid, errors }
 */
const validateBody = (validatorFn) => (req, res, next) => {
  const { isValid, errors } = validatorFn(req.body);
  if (!isValid) {
    return ApiResponse.error(res, errors[0] || 'Validation failed', 400, errors);
  }
  next();
};

/**
 * Middleware to validate MongoDB ObjectId in request params.
 * @param {string} paramName - Name of the route parameter (e.g. 'id', 'userId')
 */
const validateObjectIdParam = (paramName = 'id') => (req, res, next) => {
  const mongoose = require('mongoose');
  const id = req.params[paramName];
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.error(res, `Invalid ${paramName}: must be a valid ObjectId`, 400);
  }
  next();
};

module.exports = {
  validateBody,
  validateObjectIdParam,
};

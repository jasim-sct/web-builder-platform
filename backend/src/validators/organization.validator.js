const mongoose = require('mongoose');

const validateCreateOrganization = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Organization name is required and cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateOrganization = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Organization name cannot be empty');
    }
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  validateCreateOrganization,
  validateUpdateOrganization,
  isValidObjectId,
};

const mongoose = require('mongoose');

const validateCreateGroup = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Group name is required and cannot be empty');
  }

  if (!data.organizationId || !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('Valid organizationId is required');
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateGroup = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Group name cannot be empty');
    }
  }

  if (data.organizationId !== undefined && !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('organizationId must be a valid ObjectId');
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreateGroup,
  validateUpdateGroup,
};

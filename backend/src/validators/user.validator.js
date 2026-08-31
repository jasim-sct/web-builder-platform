const mongoose = require('mongoose');

const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

const validateCreateUser = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('User name is required and cannot be empty');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  if (!data.organizationId || !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('Valid organizationId is required');
  }

  if (data.role !== undefined && !['ADMIN', 'MEMBER'].includes(data.role)) {
    errors.push('Role must be either ADMIN or MEMBER');
  }

  if (data.phone !== undefined && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateUser = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('User name cannot be empty');
    }
  }

  if (data.email !== undefined && !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  if (data.organizationId !== undefined && !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('organizationId must be a valid ObjectId');
  }

  if (data.role !== undefined && !['ADMIN', 'MEMBER'].includes(data.role)) {
    errors.push('Role must be either ADMIN or MEMBER');
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
  validateCreateUser,
  validateUpdateUser,
};

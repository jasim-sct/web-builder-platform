const mongoose = require('mongoose');
const { isValidDate } = require('../utils/date');

const VALID_REPEAT_TYPES = ['ONCE', 'DAILY', 'WEEKLY'];
const VALID_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const VALID_STATUSES = ['SCHEDULED', 'TRIGGERED', 'DISABLED', 'CANCELLED', 'COMPLETED'];

const validateRecipientUserIds = (recipientUserIds, errors) => {
  if (recipientUserIds === undefined) return;
  if (!Array.isArray(recipientUserIds)) {
    errors.push('recipientUserIds must be an array of ObjectIds');
    return;
  }
  for (const id of recipientUserIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      errors.push('Each recipientUserIds entry must be a valid ObjectId');
      break;
    }
  }
};

const validateTimezoneId = (timezoneId, errors) => {
  if (timezoneId === undefined) return;
  if (typeof timezoneId !== 'string' || timezoneId.trim().length === 0) {
    errors.push('timezoneId must be a non-empty IANA timezone string');
  }
};

const validateCreateAlert = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Alert title is required and cannot be empty');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Alert message is required and cannot be empty');
  }

  if (!data.organizationId || !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('Valid organizationId is required');
  }

  if (!data.groupId || !mongoose.Types.ObjectId.isValid(data.groupId)) {
    errors.push('Valid groupId is required');
  }

  if (!data.scheduledAt || !isValidDate(data.scheduledAt)) {
    errors.push('Valid scheduledAt ISO date is required');
  }

  if (data.repeatType !== undefined && !VALID_REPEAT_TYPES.includes(data.repeatType)) {
    errors.push(`repeatType must be one of: ${VALID_REPEAT_TYPES.join(', ')}`);
  }

  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (data.createdBy !== undefined && data.createdBy !== null && !mongoose.Types.ObjectId.isValid(data.createdBy)) {
    errors.push('createdBy must be a valid ObjectId');
  }

  validateRecipientUserIds(data.recipientUserIds, errors);
  validateTimezoneId(data.timezoneId, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateAlert = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Alert title cannot be empty');
    }
  }

  if (data.message !== undefined) {
    if (typeof data.message !== 'string' || data.message.trim().length === 0) {
      errors.push('Alert message cannot be empty');
    }
  }

  if (data.groupId !== undefined && !mongoose.Types.ObjectId.isValid(data.groupId)) {
    errors.push('groupId must be a valid ObjectId');
  }

  if (data.scheduledAt !== undefined && !isValidDate(data.scheduledAt)) {
    errors.push('scheduledAt must be a valid date');
  }

  if (data.repeatType !== undefined && !VALID_REPEAT_TYPES.includes(data.repeatType)) {
    errors.push(`repeatType must be one of: ${VALID_REPEAT_TYPES.join(', ')}`);
  }

  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.isEnabled !== undefined && typeof data.isEnabled !== 'boolean') {
    errors.push('isEnabled must be a boolean');
  }

  validateRecipientUserIds(data.recipientUserIds, errors);
  validateTimezoneId(data.timezoneId, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateBroadcastNow = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Alert title is required and cannot be empty');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Alert message is required and cannot be empty');
  }

  if (!data.organizationId || !mongoose.Types.ObjectId.isValid(data.organizationId)) {
    errors.push('Valid organizationId is required');
  }

  if (!data.groupId || !mongoose.Types.ObjectId.isValid(data.groupId)) {
    errors.push('Valid groupId is required');
  }

  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (data.createdBy !== undefined && data.createdBy !== null && !mongoose.Types.ObjectId.isValid(data.createdBy)) {
    errors.push('createdBy must be a valid ObjectId');
  }

  validateRecipientUserIds(data.recipientUserIds, errors);
  validateTimezoneId(data.timezoneId, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAcknowledge = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
    errors.push('Valid userId is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreateAlert,
  validateUpdateAlert,
  validateBroadcastNow,
  validateAcknowledge,
};

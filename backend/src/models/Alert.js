const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
      minlength: [1, 'Alert title cannot be empty'],
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true,
      minlength: [1, 'Alert message cannot be empty'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
      index: true,
    },
    repeatType: {
      type: String,
      enum: {
        values: ['ONCE', 'DAILY', 'WEEKLY'],
        message: '{VALUE} is not a valid repeat type. Supported: ONCE, DAILY, WEEKLY',
      },
      default: 'ONCE',
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        message: '{VALUE} is not a valid priority. Supported: LOW, NORMAL, HIGH, URGENT',
      },
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: {
        values: ['SCHEDULED', 'TRIGGERED', 'DISABLED', 'CANCELLED', 'COMPLETED'],
        message: '{VALUE} is not a valid status',
      },
      default: 'SCHEDULED',
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    nextTriggerAt: {
      type: Date,
      default: null,
      index: true,
    },
    recipientUserIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    timezoneId: {
      type: String,
      default: 'UTC',
    },
    version: {
      type: Number,
      default: 1,
    },
    occurrenceCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for scheduler query: enabled alerts due for execution
alertSchema.index({ isEnabled: 1, status: 1, nextTriggerAt: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;

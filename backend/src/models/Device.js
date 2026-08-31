const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    installationId: {
      type: String,
      trim: true,
      default: '',
    },
    pushToken: {
      type: String,
      trim: true,
      default: '',
    },
    platform: {
      type: String,
      enum: ['ANDROID', 'IOS', 'WEB'],
      default: 'ANDROID',
    },
    appVersion: {
      type: String,
      trim: true,
      default: '1.0.0',
    },
    osVersion: {
      type: String,
      trim: true,
      default: '',
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC',
    },
    locale: {
      type: String,
      trim: true,
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
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

// Compound unique index: deviceId per user
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, 'eventId is required'],
      unique: true,
      trim: true,
      index: true,
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
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['ALERT', 'REMINDER', 'MANDATORY_ACK', 'BROADCAST', 'SYSTEM'],
      default: 'ALERT',
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Event message is required'],
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'CRITICAL', 'MANDATORY'],
      default: 'NORMAL',
      index: true,
    },
    requiresReceive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['CREATED', 'SCHEDULED', 'TRIGGERED', 'DELIVERED', 'RECEIVED', 'ACKNOWLEDGED', 'EXPIRED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'scheduledAt is required'],
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    receivedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deviceId: { type: String },
        receivedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    version: {
      type: Number,
      default: 1,
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

eventSchema.index({ organizationId: 1, scheduledAt: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

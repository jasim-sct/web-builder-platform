const mongoose = require('mongoose');

const alertDeliverySchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: [true, 'Alert ID is required'],
      index: true,
    },
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
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['DELIVERED', 'ACKNOWLEDGED'],
        message: '{VALUE} is not a valid delivery status. Supported: DELIVERED, ACKNOWLEDGED',
      },
      default: 'DELIVERED',
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

// Compound index to quickly find delivery for a specific user and alert
alertDeliverySchema.index({ alertId: 1, userId: 1 }, { unique: true });

const AlertDelivery = mongoose.model('AlertDelivery', alertDeliverySchema);

module.exports = AlertDelivery;

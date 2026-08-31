const Alert = require('../models/Alert');
const AlertDelivery = require('../models/AlertDelivery');
const Organization = require('../models/Organization');
const Group = require('../models/Group');
const User = require('../models/User');
const broadcastService = require('./broadcast.service');
const { calculateNextTriggerAt } = require('../utils/date');
const { ApiError } = require('../utils/apiResponse');
const { getIO } = require('../socket/socket');
const { getGroupRoom } = require('../socket/rooms');

class AlertService {
  async createAlert(data) {
    // 1. Validate Organization
    const organization = await Organization.findById(data.organizationId);
    if (!organization) {
      throw ApiError.badRequest('Organization does not exist');
    }
    if (!organization.isActive) {
      throw ApiError.badRequest('Cannot create alert for an inactive organization');
    }

    // 2. Validate Group
    const group = await Group.findById(data.groupId);
    if (!group) {
      throw ApiError.badRequest('Group does not exist');
    }
    if (!group.isActive) {
      throw ApiError.badRequest('Cannot target an inactive group with an alert');
    }
    if (group.organizationId.toString() !== data.organizationId.toString()) {
      throw ApiError.badRequest('Group does not belong to the specified organization');
    }

    // 3. Validate Creator if provided
    if (data.createdBy) {
      const creator = await User.findById(data.createdBy);
      if (!creator) {
        throw ApiError.badRequest('Creator user does not exist');
      }
      if (creator.organizationId.toString() !== data.organizationId.toString()) {
        throw ApiError.badRequest('Creator does not belong to the specified organization');
      }
    }

    const scheduledDate = new Date(data.scheduledAt);
    const repeatType = data.repeatType || 'ONCE';

    const alert = new Alert({
      title: data.title.trim(),
      message: data.message.trim(),
      organizationId: data.organizationId,
      groupId: data.groupId,
      scheduledAt: scheduledDate,
      repeatType,
      priority: data.priority || 'NORMAL',
      status: 'SCHEDULED',
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      createdBy: data.createdBy || null,
      lastTriggeredAt: null,
      nextTriggerAt: scheduledDate,
    });

    await alert.save();
    return await this.getAlertById(alert._id);
  }

  async getAllAlerts(filters = {}) {
    const query = {};

    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }

    if (filters.groupId) {
      query.groupId = filters.groupId;
    }

    if (filters.status) {
      query.status = filters.status.toUpperCase();
    }

    if (filters.priority) {
      query.priority = filters.priority.toUpperCase();
    }

    if (filters.isEnabled !== undefined) {
      query.isEnabled = filters.isEnabled === 'true' || filters.isEnabled === true;
    }

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.scheduledAt = { $gte: startOfDay, $lte: endOfDay };
    }

    return await Alert.find(query)
      .populate('organizationId', 'name isActive')
      .populate('groupId', 'name isActive')
      .populate('createdBy', 'name email role')
      .sort({ scheduledAt: 1, createdAt: -1 });
  }

  async getAlertById(id) {
    const alert = await Alert.findById(id)
      .populate('organizationId', 'name isActive')
      .populate('groupId', 'name isActive members')
      .populate('createdBy', 'name email role');

    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }
    return alert;
  }

  async updateAlert(id, data) {
    const alert = await Alert.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    if (data.groupId && data.groupId.toString() !== alert.groupId.toString()) {
      const group = await Group.findById(data.groupId);
      if (!group) {
        throw ApiError.badRequest('Target group does not exist');
      }
      if (group.organizationId.toString() !== alert.organizationId.toString()) {
        throw ApiError.badRequest('Group does not belong to the alert organization');
      }
      alert.groupId = data.groupId;
    }

    if (data.title !== undefined) alert.title = data.title.trim();
    if (data.message !== undefined) alert.message = data.message.trim();
    if (data.priority !== undefined) alert.priority = data.priority;
    if (data.status !== undefined) alert.status = data.status;
    if (data.isEnabled !== undefined) alert.isEnabled = data.isEnabled;

    if (data.scheduledAt !== undefined || data.repeatType !== undefined) {
      if (data.scheduledAt !== undefined) {
        alert.scheduledAt = new Date(data.scheduledAt);
        alert.nextTriggerAt = new Date(data.scheduledAt);
      }
      if (data.repeatType !== undefined) {
        alert.repeatType = data.repeatType;
      }
    }

    await alert.save();
    const updatedAlert = await this.getAlertById(id);

    // Notify connected sockets of alert update
    const io = getIO();
    if (io) {
      io.to(getGroupRoom(updatedAlert.groupId._id || updatedAlert.groupId)).emit('alert:updated', {
        alertId: updatedAlert._id.toString(),
        title: updatedAlert.title,
        message: updatedAlert.message,
        priority: updatedAlert.priority,
        status: updatedAlert.status,
        isEnabled: updatedAlert.isEnabled,
        updatedAt: updatedAlert.updatedAt,
      });
    }

    return updatedAlert;
  }

  async deleteAlert(id) {
    const alert = await Alert.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    await AlertDelivery.deleteMany({ alertId: id });
    await Alert.findByIdAndDelete(id);

    return { success: true, message: 'Alert deleted successfully' };
  }

  async enableAlert(id) {
    const alert = await Alert.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    alert.isEnabled = true;
    if (alert.status === 'DISABLED') {
      alert.status = 'SCHEDULED';
    }

    // If nextTriggerAt is null or in past, reset next trigger
    if (!alert.nextTriggerAt || alert.nextTriggerAt < new Date()) {
      if (alert.repeatType === 'ONCE') {
        alert.nextTriggerAt = alert.scheduledAt;
      } else {
        alert.nextTriggerAt = calculateNextTriggerAt(alert.repeatType, alert.scheduledAt, new Date());
      }
    }

    await alert.save();
    return await this.getAlertById(id);
  }

  async disableAlert(id) {
    const alert = await Alert.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    alert.isEnabled = false;
    alert.status = 'DISABLED';

    await alert.save();
    return await this.getAlertById(id);
  }

  async triggerImmediateAlert(id) {
    const alert = await Alert.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    if (!alert.isEnabled) {
      throw ApiError.badRequest('Cannot trigger a disabled alert');
    }

    const now = new Date();
    alert.lastTriggeredAt = now;

    if (alert.repeatType === 'ONCE') {
      alert.status = 'COMPLETED';
      alert.nextTriggerAt = null;
    } else {
      alert.status = 'SCHEDULED';
      alert.nextTriggerAt = calculateNextTriggerAt(alert.repeatType, alert.nextTriggerAt || now, now);
    }

    await alert.save();

    // Broadcast to current members
    const broadcastResult = await broadcastService.broadcastAlert(alert, 'alert:triggered');

    return {
      alertId: alert._id.toString(),
      groupId: alert.groupId.toString(),
      recipientCount: broadcastResult.recipientCount,
      triggeredAt: now.toISOString(),
      status: alert.status,
      nextTriggerAt: alert.nextTriggerAt,
    };
  }

  async broadcastNow(data) {
    // 1. Validate Organization
    const organization = await Organization.findById(data.organizationId);
    if (!organization) {
      throw ApiError.badRequest('Organization does not exist');
    }
    if (!organization.isActive) {
      throw ApiError.badRequest('Organization is inactive');
    }

    // 2. Validate Group
    const group = await Group.findById(data.groupId);
    if (!group) {
      throw ApiError.badRequest('Group does not exist');
    }
    if (!group.isActive) {
      throw ApiError.badRequest('Group is inactive');
    }
    if (group.organizationId.toString() !== data.organizationId.toString()) {
      throw ApiError.badRequest('Group does not belong to the specified organization');
    }

    // 3. Validate Creator if provided
    if (data.createdBy) {
      const creator = await User.findById(data.createdBy);
      if (!creator) {
        throw ApiError.badRequest('Creator user does not exist');
      }
    }

    const now = new Date();

    // 4. Create an Alert record for this broadcast
    const alert = new Alert({
      title: data.title.trim(),
      message: data.message.trim(),
      organizationId: data.organizationId,
      groupId: data.groupId,
      scheduledAt: now,
      repeatType: 'ONCE',
      priority: data.priority || 'URGENT',
      status: 'TRIGGERED',
      isEnabled: true,
      createdBy: data.createdBy || null,
      lastTriggeredAt: now,
      nextTriggerAt: null,
    });

    await alert.save();

    // 5. Broadcast to current group members
    const broadcastResult = await broadcastService.broadcastAlert(alert, 'alert:broadcast');

    return {
      alertId: alert._id.toString(),
      title: alert.title,
      message: alert.message,
      groupId: alert.groupId.toString(),
      organizationId: alert.organizationId.toString(),
      recipientCount: broadcastResult.recipientCount,
      triggeredAt: now.toISOString(),
    };
  }

  async acknowledgeAlert(alertId, userId) {
    const alert = await Alert.findById(alertId);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const now = new Date();

    // Find existing delivery or upsert safely
    const delivery = await AlertDelivery.findOneAndUpdate(
      { alertId, userId },
      {
        $set: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt: now,
        },
        $setOnInsert: {
          alertId,
          userId,
          organizationId: alert.organizationId,
          deliveredAt: now,
        },
      },
      { new: true, upsert: true }
    ).populate('userId', 'name email role');

    return delivery;
  }

  async getAlertDeliveries(alertId) {
    const alert = await Alert.findById(alertId);
    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    return await AlertDelivery.find({ alertId })
      .populate('userId', 'name email phone role isActive')
      .sort({ deliveredAt: -1 });
  }

  async getAlertHistory(filters = {}) {
    const query = {
      $or: [
        { lastTriggeredAt: { $ne: null } },
        { status: { $in: ['TRIGGERED', 'COMPLETED'] } },
      ],
    };

    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }
    if (filters.groupId) {
      query.groupId = filters.groupId;
    }
    if (filters.priority) {
      query.priority = filters.priority.toUpperCase();
    }

    return await Alert.find(query)
      .populate('organizationId', 'name isActive')
      .populate('groupId', 'name isActive')
      .populate('createdBy', 'name email role')
      .sort({ lastTriggeredAt: -1, updatedAt: -1 });
  }

  async getUpcomingAlerts(filters = {}) {
    const query = {
      isEnabled: true,
      status: 'SCHEDULED',
      nextTriggerAt: { $ne: null },
    };

    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }
    if (filters.groupId) {
      query.groupId = filters.groupId;
    }
    if (filters.priority) {
      query.priority = filters.priority.toUpperCase();
    }

    return await Alert.find(query)
      .populate('organizationId', 'name isActive')
      .populate('groupId', 'name isActive')
      .populate('createdBy', 'name email role')
      .sort({ nextTriggerAt: 1 });
  }
}

module.exports = new AlertService();

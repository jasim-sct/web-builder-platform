const Group = require('../models/Group');
const User = require('../models/User');
const AlertDelivery = require('../models/AlertDelivery');
const { getIO } = require('../socket/socket');
const { getGroupRoom, getUserRoom } = require('../socket/rooms');
const pushService = require('./push.service');
const { ApiError } = require('../utils/apiResponse');

class BroadcastService {
  /**
   * Broadcasts an alert to all current members of the alert's target group.
   *
   * @param {Object} alert - The Mongoose Alert document or alert plain object
   * @param {string} [eventName='alert:triggered'] - Socket.IO event name
   * @returns {Promise<Object>} - Broadcast result with recipient count
   */
  async broadcastAlert(alert, eventName = 'alert:triggered') {
    if (!alert) {
      throw ApiError.badRequest('Alert object is required for broadcast');
    }

    // 1. Find group and ensure it exists and is active
    const group = await Group.findById(alert.groupId);
    if (!group) {
      throw ApiError.notFound('Target group for alert not found');
    }

    // 2. Resolve current active group members dynamically
    let currentActiveMembers = await User.find({
      _id: { $in: group.members },
      isActive: true,
    });

    // Targeted delivery: restrict to explicit recipient list when provided
    const targetIds = (alert.recipientUserIds || []).map((id) => id.toString());
    if (targetIds.length > 0) {
      currentActiveMembers = currentActiveMembers.filter((m) =>
        targetIds.includes(m._id.toString())
      );
    }

    const triggeredAt = new Date();

    // 3. Create or update AlertDelivery records for all current active members
    const deliveryOperations = currentActiveMembers.map((member) => ({
      updateOne: {
        filter: { alertId: alert._id, userId: member._id },
        update: {
          $setOnInsert: {
            alertId: alert._id,
            userId: member._id,
            organizationId: alert.organizationId,
            deliveredAt: triggeredAt,
            status: 'DELIVERED',
          },
        },
        upsert: true,
      },
    }));

    if (deliveryOperations.length > 0) {
      await AlertDelivery.bulkWrite(deliveryOperations);
    }

    // 4. Construct payload for real-time clients
    const payload = {
      alertId: alert._id.toString(),
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
      groupId: alert.groupId.toString(),
      organizationId: alert.organizationId.toString(),
      repeatType: alert.repeatType,
      status: alert.status,
      triggeredAt: triggeredAt.toISOString(),
      recipientCount: currentActiveMembers.length,
      recipientUserIds: currentActiveMembers.map((u) => u._id.toString()),
    };

    // 5. Emit Socket.IO to group room and targeted user rooms
    const io = getIO();
    if (io) {
      const groupRoom = getGroupRoom(alert.groupId);
      io.to(groupRoom).emit(eventName, payload);
      for (const member of currentActiveMembers) {
        io.to(getUserRoom(member._id)).emit(eventName, payload);
      }
    }

    // 6. Optional FCM high-priority data push (wake dead processes when configured)
    const pushResult = await pushService.sendToUsers(
      currentActiveMembers.map((u) => u._id.toString()),
      {
        type: eventName === 'alert:broadcast' ? 'IMMEDIATE_ALARM' : 'ALERT_TRIGGERED',
        alertId: alert._id.toString(),
        title: alert.title,
        message: alert.message,
        priority: alert.priority,
        groupId: alert.groupId.toString(),
      }
    );

    return {
      alertId: alert._id.toString(),
      groupId: alert.groupId.toString(),
      recipientCount: currentActiveMembers.length,
      recipientUserIds: currentActiveMembers.map((u) => u._id.toString()),
      triggeredAt: triggeredAt.toISOString(),
      pushSent: pushResult.sent,
    };
  }
}

module.exports = new BroadcastService();

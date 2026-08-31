const Group = require('../models/Group');
const User = require('../models/User');
const AlertDelivery = require('../models/AlertDelivery');
const { getIO } = require('../socket/socket');
const { getGroupRoom, getOrganizationRoom } = require('../socket/rooms');
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
    const currentActiveMembers = await User.find({
      _id: { $in: group.members },
      isActive: true,
    });

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
    };

    // 5. Emit Socket.IO event to group room (and organization room for admins if needed)
    const io = getIO();
    if (io) {
      const groupRoom = getGroupRoom(alert.groupId);
      io.to(groupRoom).emit(eventName, payload);
    }

    return {
      alertId: alert._id.toString(),
      groupId: alert.groupId.toString(),
      recipientCount: currentActiveMembers.length,
      recipientUserIds: currentActiveMembers.map((u) => u._id.toString()),
      triggeredAt: triggeredAt.toISOString(),
    };
  }
}

module.exports = new BroadcastService();

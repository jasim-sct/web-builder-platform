const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const Group = require('../models/Group');
const User = require('../models/User');
const { getIO } = require('../socket/socket');
const { getGroupRoom, getUserRoom } = require('../socket/rooms');

class EventController {
  createEvent = asyncHandler(async (req, res) => {
    const {
      eventId,
      organizationId,
      groupId,
      userId,
      type,
      title,
      message,
      payload,
      priority,
      requiresReceive,
      scheduledAt,
      expiresAt,
      createdBy,
    } = req.body;

    if (!title || !message || !organizationId || !scheduledAt) {
      throw ApiError.badRequest('title, message, organizationId, and scheduledAt are required');
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    const id = eventId || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const event = new Event({
      eventId: id,
      organizationId,
      groupId: groupId || null,
      userId: userId || null,
      type: type || 'ALERT',
      title: title.trim(),
      message: message.trim(),
      payload: payload || {},
      priority: priority || 'NORMAL',
      requiresReceive: requiresReceive !== undefined ? requiresReceive : true,
      status: 'SCHEDULED',
      scheduledAt: new Date(scheduledAt),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: createdBy || null,
    });

    await event.save();

    // Broadcast via socket if group room or user room available
    const io = getIO();
    if (io) {
      const eventPayload = {
        eventId: event.eventId,
        type: event.type,
        title: event.title,
        message: event.message,
        priority: event.priority,
        requiresReceive: event.requiresReceive,
        scheduledAt: event.scheduledAt,
        status: event.status,
      };

      if (event.groupId) {
        io.to(getGroupRoom(event.groupId)).emit('event:created', eventPayload);
      } else if (event.userId) {
        io.to(getUserRoom(event.userId)).emit('event:created', eventPayload);
      }
    }

    return ApiResponse.created(res, event, 'Event created and scheduled successfully');
  });

  syncEvents = asyncHandler(async (req, res) => {
    const { userId, organizationId, deviceId } = req.query;

    let targetOrgId = organizationId;
    let targetUser = null;

    if (userId) {
      targetUser = await User.findById(userId);
      if (targetUser) {
        targetOrgId = targetUser.organizationId;
      }
    }

    if (!targetOrgId) {
      throw ApiError.badRequest('userId or organizationId is required for event sync');
    }

    // Get groups user belongs to
    let groupIds = [];
    if (targetUser) {
      const groups = await Group.find({ members: targetUser._id, isActive: true });
      groupIds = groups.map((g) => g._id);
    }

    const query = {
      organizationId: targetOrgId,
      $or: [
        { groupId: { $in: groupIds } },
        { userId: targetUser ? targetUser._id : null },
        { groupId: null, userId: null }, // Org-wide
      ],
      status: { $nin: ['CANCELLED'] },
    };

    const events = await Event.find(query)
      .populate('groupId', 'name')
      .populate('createdBy', 'name email')
      .sort({ scheduledAt: 1 });

    const now = new Date();
    return ApiResponse.success(
      res,
      {
        serverTime: now.toISOString(),
        version: 1,
        events,
      },
      'Events synchronized'
    );
  });

  receiveEvent = asyncHandler(async (req, res) => {
    const { id } = req.params; // Can be MongoDB _id or custom eventId
    const { userId, deviceId, receivedAt } = req.body;

    if (!userId) {
      throw ApiError.unauthorized('userId is required');
    }
    if (!deviceId) {
      throw ApiError.badRequest('deviceId is required');
    }

    const event = await Event.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { eventId: id }],
    });

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    if (user.organizationId.toString() !== event.organizationId.toString()) {
      throw ApiError.forbidden('User does not belong to event organization');
    }

    if (event.status === 'CANCELLED') {
      throw ApiError.badRequest('Event is cancelled');
    }
    if (event.expiresAt && new Date() > new Date(event.expiresAt)) {
      throw ApiError.badRequest('Event has expired');
    }

    const now = receivedAt ? new Date(receivedAt) : new Date();

    // Idempotent record receipt
    const existingIndex = event.receivedBy.findIndex(
      (r) => r.userId?.toString() === userId?.toString() && r.deviceId === deviceId
    );

    if (existingIndex === -1) {
      event.receivedBy.push({
        userId: userId || null,
        deviceId: deviceId || '',
        receivedAt: now,
      });
      event.status = 'RECEIVED';
      await event.save();
    }

    // Emit Socket acknowledgement update to organization room
    const io = getIO();
    if (io) {
      io.to(getGroupRoom(event.groupId || event.organizationId)).emit('event:acknowledged', {
        eventId: event.eventId,
        userId,
        deviceId,
        receivedAt: now.toISOString(),
      });
    }

    return ApiResponse.success(res, event, 'Event receipt acknowledged');
  });

  dismissEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, deviceId, receivedAt } = req.body;

    if (!userId) {
      throw ApiError.unauthorized('userId is required');
    }

    const event = await Event.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { eventId: id }],
    });

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const user = await User.findById(userId);
    if (!user || user.organizationId.toString() !== event.organizationId.toString()) {
      throw ApiError.forbidden('User not authorized for this event');
    }

    const now = receivedAt ? new Date(receivedAt) : new Date();
    if (event.status !== 'RECEIVED' && event.status !== 'ACKNOWLEDGED') {
      event.status = 'CANCELLED';
    }
    event.receivedBy.push({
      userId,
      deviceId: deviceId || '',
      receivedAt: now,
    });
    await event.save();

    return ApiResponse.success(res, event, 'Event dismissed');
  });

  getEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await Event.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { eventId: id }],
    })
      .populate('groupId', 'name')
      .populate('createdBy', 'name email')
      .populate('receivedBy.userId', 'name email');

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    return ApiResponse.success(res, event);
  });
}

module.exports = new EventController();

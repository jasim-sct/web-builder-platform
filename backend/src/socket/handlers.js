const User = require('../models/User');
const Group = require('../models/Group');
const AlertDelivery = require('../models/AlertDelivery');
const { getOrganizationRoom, getGroupRoom, getUserRoom } = require('./rooms');
const { isAuthRequired, validateApiKey } = require('../utils/apiKeyAuth');

const getSocketApiKey = (socket, payload = {}) => {
  const headerKey = socket.handshake.headers?.['x-api-key'];
  const authKey = socket.handshake.auth?.apiKey;
  const payloadKey = payload.apiKey;
  return authKey || headerKey || payloadKey || null;
};

const registerSocketHandlers = (io, socket) => {
  // Store session metadata on socket
  socket.data = socket.data || {};

  /**
   * Client identifies with userId
   * Backend joins user to:
   * 1. Personal room: user:{userId}
   * 2. Organization room: organization:{organizationId}
   * 3. Group rooms: group:{groupId} for every group the user belongs to
   */
  socket.on('identify', async (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { userId } = data;

      if (isAuthRequired() && !validateApiKey(getSocketApiKey(socket, data))) {
        const errRes = { success: false, message: 'Invalid or missing API key' };
        if (typeof callback === 'function') callback(errRes);
        socket.emit('error', errRes);
        return;
      }

      if (!userId) {
        const errRes = { success: false, message: 'userId is required for identification' };
        if (typeof callback === 'function') callback(errRes);
        socket.emit('error', errRes);
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        const errRes = { success: false, message: 'User not found' };
        if (typeof callback === 'function') callback(errRes);
        socket.emit('error', errRes);
        return;
      }

      if (!user.isActive) {
        const errRes = { success: false, message: 'User is inactive' };
        if (typeof callback === 'function') callback(errRes);
        socket.emit('error', errRes);
        return;
      }

      // Associate socket with user
      socket.data.userId = user._id.toString();
      socket.data.organizationId = user.organizationId.toString();

      // 1. Join user room
      const userRoom = getUserRoom(user._id);
      socket.join(userRoom);

      // 2. Join organization room
      const orgRoom = getOrganizationRoom(user.organizationId);
      socket.join(orgRoom);

      // 3. Find and join all active groups the user belongs to
      const groups = await Group.find({
        organizationId: user.organizationId,
        members: user._id,
        isActive: true,
      });

      const joinedGroups = [];
      for (const group of groups) {
        const groupRoom = getGroupRoom(group._id);
        socket.join(groupRoom);
        joinedGroups.push(group._id.toString());
      }

      const responseData = {
        success: true,
        message: 'Successfully identified and joined rooms',
        data: {
          userId: user._id.toString(),
          organizationId: user.organizationId.toString(),
          rooms: [userRoom, orgRoom, ...joinedGroups.map(getGroupRoom)],
          groupCount: joinedGroups.length,
        },
      };

      if (typeof callback === 'function') {
        callback(responseData);
      }
      socket.emit('identified', responseData);
    } catch (error) {
      console.error('[Socket] Error in identify handler:', error);
      const errRes = { success: false, message: error.message };
      if (typeof callback === 'function') callback(errRes);
      socket.emit('error', errRes);
    }
  });

  /**
   * Explicit join organization room
   */
  socket.on('join:organization', (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { organizationId } = data;
      if (organizationId) {
        const room = getOrganizationRoom(organizationId);
        socket.join(room);
        const res = { success: true, message: `Joined ${room}` };
        if (typeof callback === 'function') callback(res);
        socket.emit('joined:organization', res);
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  /**
   * Explicit join group room
   */
  socket.on('join:group', (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { groupId } = data;
      if (groupId) {
        const room = getGroupRoom(groupId);
        socket.join(room);
        const res = { success: true, message: `Joined ${room}` };
        if (typeof callback === 'function') callback(res);
        socket.emit('joined:group', res);
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  /**
   * Explicit leave group room
   */
  socket.on('leave:group', (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { groupId } = data;
      if (groupId) {
        const room = getGroupRoom(groupId);
        socket.leave(room);
        const res = { success: true, message: `Left ${room}` };
        if (typeof callback === 'function') callback(res);
        socket.emit('left:group', res);
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  /**
   * Acknowledge alert from socket
   */
  socket.on('alert:acknowledge', async (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { alertId, userId } = data;
      const targetUserId = userId || socket.data.userId;

      if (!alertId || !targetUserId) {
        const res = { success: false, message: 'alertId and userId are required' };
        if (typeof callback === 'function') callback(res);
        socket.emit('error', res);
        return;
      }

      const delivery = await AlertDelivery.findOneAndUpdate(
        { alertId, userId: targetUserId },
        { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
        { new: true }
      );

      const res = {
        success: true,
        message: delivery ? 'Alert acknowledged' : 'Delivery record not found for user',
        data: delivery,
      };

      if (typeof callback === 'function') callback(res);
      socket.emit('alert:acknowledged', res);
    } catch (error) {
      const res = { success: false, message: error.message };
      if (typeof callback === 'function') callback(res);
      socket.emit('error', res);
    }
  });

  socket.on('disconnect', () => {
    // Clean disconnect
  });
};

module.exports = {
  registerSocketHandlers,
};

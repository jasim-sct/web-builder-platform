/**
 * Standardized room name helpers for Socket.IO
 */
const getOrganizationRoom = (organizationId) => `organization:${organizationId}`;
const getGroupRoom = (groupId) => `group:${groupId}`;
const getUserRoom = (userId) => `user:${userId}`;

module.exports = {
  getOrganizationRoom,
  getGroupRoom,
  getUserRoom,
};

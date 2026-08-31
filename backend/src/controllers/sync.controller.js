const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Group = require('../models/Group');
const Alert = require('../models/Alert');
const AlertDelivery = require('../models/AlertDelivery');

/**
 * Controller for single round-trip full synchronization
 * GET /api/sync?userId=...&organizationId=...
 */
class SyncController {
  getSyncData = asyncHandler(async (req, res) => {
    const { userId, organizationId } = req.query;

    let targetUser = null;
    let targetOrgId = organizationId;

    if (userId) {
      targetUser = await User.findById(userId);
      if (!targetUser) {
        throw ApiError.notFound('User not found for synchronization');
      }
      targetOrgId = targetUser.organizationId;
    }

    if (!targetOrgId) {
      throw ApiError.badRequest('Either userId or organizationId must be provided');
    }

    const organization = await Organization.findById(targetOrgId);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    // 1. Fetch groups (if targetUser and not ADMIN, only their groups, or all active org groups)
    let groupQuery = { organizationId: targetOrgId, isActive: true };
    if (targetUser && targetUser.role !== 'ADMIN') {
      groupQuery.members = targetUser._id;
    }
    const groups = await Group.find(groupQuery).populate('members', 'name email role isActive');

    const groupIds = groups.map((g) => g._id);

    // 2. Fetch active and scheduled alerts
    let alertQuery = {
      organizationId: targetOrgId,
      $or: [
        { status: { $in: ['SCHEDULED', 'TRIGGERED', 'COMPLETED'] } },
        { isEnabled: true },
      ],
    };

    // If member, only alerts for groups they belong to
    if (targetUser && targetUser.role !== 'ADMIN') {
      alertQuery.groupId = { $in: groupIds };
    }

    const alerts = await Alert.find(alertQuery)
      .populate('organizationId', 'name isActive')
      .populate('groupId', 'name isActive')
      .populate('createdBy', 'name email role')
      .sort({ scheduledAt: 1 });

    // 3. Memberships list for easy client reconciliation
    const memberships = [];
    for (const group of groups) {
      for (const member of group.members) {
        memberships.push({
          groupId: group._id.toString(),
          userId: member._id ? member._id.toString() : member.toString(),
        });
      }
    }

    // 4. Deliveries for user
    let deliveries = [];
    if (targetUser) {
      deliveries = await AlertDelivery.find({ userId: targetUser._id })
        .sort({ deliveredAt: -1 })
        .limit(50);
    }

    // 5. Build response payload
    const now = new Date();
    const syncPayload = {
      version: 1,
      serverTime: now.toISOString(),
      user: targetUser,
      organization,
      groups,
      memberships,
      alerts,
      deliveries,
    };

    return ApiResponse.success(res, syncPayload, 'Synchronization data retrieved successfully');
  });
}

module.exports = new SyncController();

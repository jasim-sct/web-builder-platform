const Group = require('../models/Group');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');

class GroupService {
  async createGroup(data) {
    const organization = await Organization.findById(data.organizationId);
    if (!organization) {
      throw ApiError.badRequest('Organization does not exist');
    }
    if (!organization.isActive) {
      throw ApiError.badRequest('Cannot create group for an inactive organization');
    }

    const group = new Group({
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      organizationId: data.organizationId,
      members: [],
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return await group.save();
  }

  async getAllGroups(filters = {}) {
    const query = {};

    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    return await Group.find(query)
      .populate('organizationId', 'name isActive')
      .populate('members', 'name email role isActive')
      .sort({ createdAt: -1 });
  }

  async getGroupById(id) {
    const group = await Group.findById(id)
      .populate('organizationId', 'name isActive')
      .populate('members', 'name email role isActive');

    if (!group) {
      throw ApiError.notFound('Group not found');
    }
    return group;
  }

  async updateGroup(id, data) {
    const group = await Group.findById(id);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    if (data.organizationId && data.organizationId.toString() !== group.organizationId.toString()) {
      const org = await Organization.findById(data.organizationId);
      if (!org) {
        throw ApiError.badRequest('Target organization does not exist');
      }
      group.organizationId = data.organizationId;
    }

    if (data.name !== undefined) group.name = data.name.trim();
    if (data.description !== undefined) group.description = data.description.trim();
    if (data.isActive !== undefined) group.isActive = data.isActive;

    await group.save();
    return await this.getGroupById(id);
  }

  async deleteGroup(id) {
    const group = await Group.findById(id);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }
    await Group.findByIdAndDelete(id);
    return { success: true, message: 'Group deleted successfully' };
  }

  async addMember(groupId, userId) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Validate organization consistency
    if (user.organizationId.toString() !== group.organizationId.toString()) {
      throw ApiError.badRequest('User does not belong to the same organization as the group');
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      (mId) => mId.toString() === userId.toString()
    );
    if (isAlreadyMember) {
      throw ApiError.conflict('User is already a member of this group');
    }

    group.members.push(user._id);
    await group.save();

    return await this.getGroupById(groupId);
  }

  async removeMember(groupId, userId) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const memberIndex = group.members.findIndex(
      (mId) => mId.toString() === userId.toString()
    );
    if (memberIndex === -1) {
      throw ApiError.notFound('User is not a member of this group');
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    return await this.getGroupById(groupId);
  }

  async getGroupMembers(groupId) {
    const group = await Group.findById(groupId).populate(
      'members',
      'name email phone role isActive createdAt'
    );
    if (!group) {
      throw ApiError.notFound('Group not found');
    }
    return group.members;
  }
}

module.exports = new GroupService();

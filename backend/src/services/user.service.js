const User = require('../models/User');
const Organization = require('../models/Organization');
const { ApiError } = require('../utils/apiResponse');

class UserService {
  async createUser(data) {
    // Validate organization existence
    const organization = await Organization.findById(data.organizationId);
    if (!organization) {
      throw ApiError.badRequest('Organization does not exist');
    }
    if (!organization.isActive) {
      throw ApiError.badRequest('Cannot create user for an inactive organization');
    }

    // Check for duplicate email in same organization
    const existingUser = await User.findOne({
      email: data.email.toLowerCase().trim(),
      organizationId: data.organizationId,
    });
    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists in the organization');
    }

    const user = new User({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? data.phone.trim() : '',
      role: data.role || 'MEMBER',
      organizationId: data.organizationId,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return await user.save();
  }

  async getAllUsers(filters = {}) {
    const query = {};

    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }

    if (filters.role) {
      query.role = filters.role.toUpperCase();
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    return await User.find(query)
      .populate('organizationId', 'name isActive')
      .sort({ createdAt: -1 });
  }

  async getUserById(id) {
    const user = await User.findById(id).populate('organizationId', 'name isActive');
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async updateUser(id, data) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // If changing organizationId, check it exists
    if (data.organizationId && data.organizationId.toString() !== user.organizationId.toString()) {
      const org = await Organization.findById(data.organizationId);
      if (!org) {
        throw ApiError.badRequest('Target organization does not exist');
      }
      user.organizationId = data.organizationId;
    }

    // If changing email, check uniqueness in org
    if (data.email && data.email.toLowerCase().trim() !== user.email) {
      const targetOrg = data.organizationId || user.organizationId;
      const existing = await User.findOne({
        email: data.email.toLowerCase().trim(),
        organizationId: targetOrg,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict('A user with this email already exists in the organization');
      }
      user.email = data.email.toLowerCase().trim();
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.role !== undefined) user.role = data.role.toUpperCase();
    if (data.isActive !== undefined) user.isActive = data.isActive;

    return await user.save();
  }

  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await User.findByIdAndDelete(id);
    return { success: true, message: 'User deleted successfully' };
  }
}

module.exports = new UserService();

const Organization = require('../models/Organization');
const { ApiError } = require('../utils/apiResponse');

class OrganizationService {
  async createOrganization(data) {
    const organization = new Organization({
      name: data.name,
      description: data.description || '',
      createdBy: data.createdBy || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return await organization.save();
  }

  async getOrganizationById(id) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }
    return organization;
  }

  async getAllOrganizations(filter = {}) {
    const query = {};
    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive === 'true' || filter.isActive === true;
    }
    return await Organization.find(query).sort({ createdAt: -1 });
  }

  async updateOrganization(id, data) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    if (data.name !== undefined) organization.name = data.name;
    if (data.description !== undefined) organization.description = data.description;
    if (data.isActive !== undefined) organization.isActive = data.isActive;

    return await organization.save();
  }

  async deleteOrganization(id) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }
    await Organization.findByIdAndDelete(id);
    return { success: true, message: 'Organization deleted successfully' };
  }
}

module.exports = new OrganizationService();

const organizationService = require('../services/organization.service');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class OrganizationController {
  createOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.createOrganization(req.body);
    return ApiResponse.created(res, organization, 'Organization created successfully');
  });

  getOrganizationById = asyncHandler(async (req, res) => {
    const organization = await organizationService.getOrganizationById(req.params.id);
    return ApiResponse.success(res, organization, 'Organization retrieved successfully');
  });

  getAllOrganizations = asyncHandler(async (req, res) => {
    const organizations = await organizationService.getAllOrganizations(req.query);
    return ApiResponse.success(res, organizations, 'Organizations retrieved successfully');
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.updateOrganization(req.params.id, req.body);
    return ApiResponse.success(res, organization, 'Organization updated successfully');
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.deleteOrganization(req.params.id);
    return ApiResponse.success(res, result, 'Organization deleted successfully');
  });
}

module.exports = new OrganizationController();

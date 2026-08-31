const groupService = require('../services/group.service');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class GroupController {
  createGroup = asyncHandler(async (req, res) => {
    const group = await groupService.createGroup(req.body);
    return ApiResponse.created(res, group, 'Group created successfully');
  });

  getAllGroups = asyncHandler(async (req, res) => {
    const groups = await groupService.getAllGroups(req.query);
    return ApiResponse.success(res, groups, 'Groups retrieved successfully');
  });

  getGroupById = asyncHandler(async (req, res) => {
    const group = await groupService.getGroupById(req.params.id);
    return ApiResponse.success(res, group, 'Group retrieved successfully');
  });

  updateGroup = asyncHandler(async (req, res) => {
    const group = await groupService.updateGroup(req.params.id, req.body);
    return ApiResponse.success(res, group, 'Group updated successfully');
  });

  deleteGroup = asyncHandler(async (req, res) => {
    const result = await groupService.deleteGroup(req.params.id);
    return ApiResponse.success(res, result, 'Group deleted successfully');
  });

  addMember = asyncHandler(async (req, res) => {
    const group = await groupService.addMember(req.params.id, req.params.userId);
    return ApiResponse.success(res, group, 'Member added to group successfully');
  });

  removeMember = asyncHandler(async (req, res) => {
    const group = await groupService.removeMember(req.params.id, req.params.userId);
    return ApiResponse.success(res, group, 'Member removed from group successfully');
  });

  getMembers = asyncHandler(async (req, res) => {
    const members = await groupService.getGroupMembers(req.params.id);
    return ApiResponse.success(res, members, 'Group members retrieved successfully');
  });
}

module.exports = new GroupController();

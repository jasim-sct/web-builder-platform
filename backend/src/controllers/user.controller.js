const userService = require('../services/user.service');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    return ApiResponse.created(res, user, 'User created successfully');
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req.query);
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, user, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, result, 'User deleted successfully');
  });
}

module.exports = new UserController();

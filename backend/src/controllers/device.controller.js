const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Device = require('../models/Device');
const User = require('../models/User');

class DeviceController {
  registerDevice = asyncHandler(async (req, res) => {
    const { userId, deviceId, installationId, pushToken, platform, appVersion, osVersion, timezone, locale } = req.body;

    if (!userId || !deviceId) {
      throw ApiError.badRequest('userId and deviceId are required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const device = await Device.findOneAndUpdate(
      { userId, deviceId },
      {
        $set: {
          organizationId: user.organizationId,
          installationId: installationId || '',
          pushToken: pushToken || '',
          platform: platform || 'ANDROID',
          appVersion: appVersion || '1.0.0',
          osVersion: osVersion || '',
          timezone: timezone || 'UTC',
          locale: locale || 'en',
          isActive: true,
          lastSeenAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return ApiResponse.success(res, device, 'Device registered successfully');
  });

  heartbeat = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const device = await Device.findByIdAndUpdate(
      id,
      { $set: { lastSeenAt: new Date(), isActive: true } },
      { new: true }
    );

    if (!device) {
      throw ApiError.notFound('Device not found');
    }

    return ApiResponse.success(res, device, 'Heartbeat recorded');
  });

  getDevicesByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const devices = await Device.find({ userId, isActive: true }).sort({ lastSeenAt: -1 });
    return ApiResponse.success(res, devices);
  });
}

module.exports = new DeviceController();

const alertService = require('../services/alert.service');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AlertController {
  createAlert = asyncHandler(async (req, res) => {
    const alert = await alertService.createAlert(req.body);
    return ApiResponse.created(res, alert, 'Alert created successfully');
  });

  getAllAlerts = asyncHandler(async (req, res) => {
    const alerts = await alertService.getAllAlerts(req.query);
    return ApiResponse.success(res, alerts, 'Alerts retrieved successfully');
  });

  getAlertById = asyncHandler(async (req, res) => {
    const alert = await alertService.getAlertById(req.params.id);
    return ApiResponse.success(res, alert, 'Alert retrieved successfully');
  });

  updateAlert = asyncHandler(async (req, res) => {
    const alert = await alertService.updateAlert(req.params.id, req.body);
    return ApiResponse.success(res, alert, 'Alert updated successfully');
  });

  deleteAlert = asyncHandler(async (req, res) => {
    const result = await alertService.deleteAlert(req.params.id);
    return ApiResponse.success(res, result, 'Alert deleted successfully');
  });

  enableAlert = asyncHandler(async (req, res) => {
    const alert = await alertService.enableAlert(req.params.id);
    return ApiResponse.success(res, alert, 'Alert enabled successfully');
  });

  disableAlert = asyncHandler(async (req, res) => {
    const alert = await alertService.disableAlert(req.params.id);
    return ApiResponse.success(res, alert, 'Alert disabled successfully');
  });

  triggerAlert = asyncHandler(async (req, res) => {
    const result = await alertService.triggerImmediateAlert(req.params.id);
    return ApiResponse.success(res, result, 'Alert broadcast successfully');
  });

  broadcastNow = asyncHandler(async (req, res) => {
    const result = await alertService.broadcastNow(req.body);
    return ApiResponse.success(res, result, 'Immediate broadcast sent successfully');
  });

  acknowledgeAlert = asyncHandler(async (req, res) => {
    const delivery = await alertService.acknowledgeAlert(req.params.id, req.body.userId);
    return ApiResponse.success(res, delivery, 'Alert acknowledged successfully');
  });

  getAlertDeliveries = asyncHandler(async (req, res) => {
    const deliveries = await alertService.getAlertDeliveries(req.params.id);
    return ApiResponse.success(res, deliveries, 'Alert deliveries retrieved successfully');
  });

  getAlertHistory = asyncHandler(async (req, res) => {
    const history = await alertService.getAlertHistory(req.query);
    return ApiResponse.success(res, history, 'Alert history retrieved successfully');
  });

  getUpcomingAlerts = asyncHandler(async (req, res) => {
    const upcoming = await alertService.getUpcomingAlerts(req.query);
    return ApiResponse.success(res, upcoming, 'Upcoming alerts retrieved successfully');
  });
}

module.exports = new AlertController();

const express = require('express');
const alertController = require('../controllers/alert.controller');
const { validateBody, validateObjectIdParam } = require('../middleware/validation.middleware');
const {
  validateCreateAlert,
  validateUpdateAlert,
  validateBroadcastNow,
  validateAcknowledge,
} = require('../validators/alert.validator');

const router = express.Router();

// Specific routes before parameterized /:id routes
router.get('/history', alertController.getAlertHistory);
router.get('/upcoming', alertController.getUpcomingAlerts);
router.post(
  '/broadcast',
  validateBody(validateBroadcastNow),
  alertController.broadcastNow
);

// Base collection routes
router
  .route('/')
  .post(validateBody(validateCreateAlert), alertController.createAlert)
  .get(alertController.getAllAlerts);

// Parameterized item routes
router
  .route('/:id')
  .get(validateObjectIdParam('id'), alertController.getAlertById)
  .put(
    validateObjectIdParam('id'),
    validateBody(validateUpdateAlert),
    alertController.updateAlert
  )
  .delete(validateObjectIdParam('id'), alertController.deleteAlert);

// Alert actions
router.post('/:id/enable', validateObjectIdParam('id'), alertController.enableAlert);
router.post('/:id/disable', validateObjectIdParam('id'), alertController.disableAlert);
router.post('/:id/trigger', validateObjectIdParam('id'), alertController.triggerAlert);
router.post(
  '/:id/acknowledge',
  validateObjectIdParam('id'),
  validateBody(validateAcknowledge),
  alertController.acknowledgeAlert
);
router.get(
  '/:id/deliveries',
  validateObjectIdParam('id'),
  alertController.getAlertDeliveries
);

module.exports = router;

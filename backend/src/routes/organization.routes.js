const express = require('express');
const organizationController = require('../controllers/organization.controller');
const { validateBody, validateObjectIdParam } = require('../middleware/validation.middleware');
const {
  validateCreateOrganization,
  validateUpdateOrganization,
} = require('../validators/organization.validator');

const router = express.Router();

router
  .route('/')
  .post(validateBody(validateCreateOrganization), organizationController.createOrganization)
  .get(organizationController.getAllOrganizations);

router
  .route('/:id')
  .get(validateObjectIdParam('id'), organizationController.getOrganizationById)
  .put(
    validateObjectIdParam('id'),
    validateBody(validateUpdateOrganization),
    organizationController.updateOrganization
  )
  .delete(validateObjectIdParam('id'), organizationController.deleteOrganization);

module.exports = router;

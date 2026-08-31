const express = require('express');
const groupController = require('../controllers/group.controller');
const { validateBody, validateObjectIdParam } = require('../middleware/validation.middleware');
const {
  validateCreateGroup,
  validateUpdateGroup,
} = require('../validators/group.validator');

const router = express.Router();

router
  .route('/')
  .post(validateBody(validateCreateGroup), groupController.createGroup)
  .get(groupController.getAllGroups);

router
  .route('/:id')
  .get(validateObjectIdParam('id'), groupController.getGroupById)
  .put(
    validateObjectIdParam('id'),
    validateBody(validateUpdateGroup),
    groupController.updateGroup
  )
  .delete(validateObjectIdParam('id'), groupController.deleteGroup);

router.get('/:id/members', validateObjectIdParam('id'), groupController.getMembers);

router
  .route('/:id/members/:userId')
  .post(
    validateObjectIdParam('id'),
    validateObjectIdParam('userId'),
    groupController.addMember
  )
  .delete(
    validateObjectIdParam('id'),
    validateObjectIdParam('userId'),
    groupController.removeMember
  );

module.exports = router;

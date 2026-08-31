const express = require('express');
const userController = require('../controllers/user.controller');
const { validateBody, validateObjectIdParam } = require('../middleware/validation.middleware');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../validators/user.validator');

const router = express.Router();

router
  .route('/')
  .post(validateBody(validateCreateUser), userController.createUser)
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(validateObjectIdParam('id'), userController.getUserById)
  .put(
    validateObjectIdParam('id'),
    validateBody(validateUpdateUser),
    userController.updateUser
  )
  .delete(validateObjectIdParam('id'), userController.deleteUser);

module.exports = router;

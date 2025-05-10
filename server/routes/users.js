const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, isAdmin, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', authenticate, isAdmin, userController.getUserById);

// @route   PUT /api/users/:id/permissions
// @desc    Update user permissions
// @access  Private/Admin
router.put(
  '/:id/permissions',
  [
    authenticate,
    isAdmin,
    [
      check('permissions', 'Permissions object is required').isObject()
    ]
  ],
  userController.updatePermissions
);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

// @route   GET /api/users/check-limit
// @desc    Check if user limit (5) is reached
// @access  Private/Admin
router.get('/check-limit', authenticate, isAdmin, userController.checkUserLimit);

module.exports = router;

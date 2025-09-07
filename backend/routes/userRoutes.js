
const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin, attachUser } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('contactNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid contact number'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const updateUserStatusValidation = [
  ...userIdValidation,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Protected user routes (require authentication)
router.use(requireAuth);
router.use(attachUser);

// User dashboard and profile routes
router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.get('/orders-summary', userController.getOrdersSummary);

// Admin only routes
router.get('/:userId', requireAdmin, userIdValidation, userController.getUserById);

module.exports = router;
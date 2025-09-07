const express = require('express');
const { body, param, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('purchaseDate')
    .isISO8601()
    .withMessage('Invalid purchase date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Purchase date cannot be in the past');
      }
      
      if (date.getDay() === 0) {
        throw new Error('Delivery is not available on Sundays');
      }
      
      return true;
    }),
  body('preferredDeliveryTime')
    .isIn(['10 AM', '11 AM', '12 PM'])
    .withMessage('Delivery time must be 10 AM, 11 AM, or 12 PM'),
  body('preferredDeliveryLocation')
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid delivery location'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

const updateOrderValidation = [
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid purchase date format')
    .custom((value) => {
      if (!value) return true;
      
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Purchase date cannot be in the past');
      }
      
      if (date.getDay() === 0) {
        throw new Error('Delivery is not available on Sundays');
      }
      
      return true;
    }),
  body('preferredDeliveryTime')
    .optional()
    .isIn(['10 AM', '11 AM', '12 PM'])
    .withMessage('Delivery time must be 10 AM, 11 AM, or 12 PM'),
  body('preferredDeliveryLocation')
    .optional()
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid delivery location'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

const orderIdValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format')
];

const cancelOrderValidation = [
  ...orderIdValidation,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancel reason cannot exceed 200 characters')
];

const updateStatusValidation = [
  ...orderIdValidation,
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status filter')
];

// All routes require authentication
router.use(authenticate);

// User order routes
router.post('/', createOrderValidation, orderController.createOrder);
router.get('/my-orders', paginationValidation, orderController.getUserOrders);
router.get('/upcoming', orderController.getUpcomingOrders);
router.get('/past', orderController.getPastOrders);
router.get('/delivery-locations', orderController.getDeliveryLocations);
router.get('/delivery-times', orderController.getDeliveryTimes);

// Individual order routes
router.get('/:orderId', orderIdValidation, orderController.getOrderById);
router.put('/:orderId', orderIdValidation, updateOrderValidation, orderController.updateOrder);
router.patch('/:orderId/cancel', cancelOrderValidation, orderController.cancelOrder);

// Admin only routes
router.get('/', requireAdmin, paginationValidation, orderController.getAllOrders);
router.patch('/:orderId/status', requireAdmin, updateStatusValidation, orderController.updateOrderStatus);
router.get('/admin/statistics', requireAdmin, orderController.getOrderStatistics);

module.exports = router;
const express = require('express');
const { body, param, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin, attachUser } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('productName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and must be less than 100 characters'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('deliveryDate')
    .isISO8601()
    .withMessage('Valid delivery date is required')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Delivery date cannot be in the past');
      }
      
      if (date.getDay() === 0) { // Sunday = 0
        throw new Error('Delivery is not available on Sundays');
      }
      
      return true;
    }),
  body('deliveryTime')
    .isIn(['10 AM', '11 AM', '12 PM'])
    .withMessage('Delivery time must be 10 AM, 11 AM, or 12 PM'),
  body('deliveryLocation')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Delivery location is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

const updateOrderValidation = [
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Valid delivery date is required')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
          throw new Error('Delivery date cannot be in the past');
        }
        
        if (date.getDay() === 0) {
          throw new Error('Delivery is not available on Sundays');
        }
      }
      return true;
    }),
  body('deliveryTime')
    .optional()
    .isIn(['10 AM', '11 AM', '12 PM'])
    .withMessage('Delivery time must be 10 AM, 11 AM, or 12 PM'),
  body('deliveryLocation')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Delivery location cannot be empty'),
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
    .withMessage('Cancellation reason cannot exceed 200 characters')
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
router.use(requireAuth);
router.use(attachUser);

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
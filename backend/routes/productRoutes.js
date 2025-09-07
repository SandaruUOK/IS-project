const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Other'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Other'])
    .withMessage('Invalid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format')
];

const stockUpdateValidation = [
  ...productIdValidation,
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  query('category')
    .optional()
    .isIn(['all', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Other'])
    .withMessage('Invalid category')
];

// Public routes (no authentication required)
router.get('/', optionalAuth, searchValidation, productController.getAllProducts);
router.get('/:productId', optionalAuth, productIdValidation, productController.getProductById);

// Admin only routes (require authentication and admin role)
router.post('/', authenticate, requireAdmin, productValidation, productController.createProduct);
router.delete('/:productId', authenticate, requireAdmin, productIdValidation, productController.deleteProduct);
router.patch('/:productId/stock', authenticate, requireAdmin, stockUpdateValidation, productController.updateStock);

module.exports = router;
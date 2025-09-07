
const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Auth0 login route
router.get('/login', authRateLimit, authController.login);

// Auth0 callback route
router.get('/callback', authController.callback);

// Auth check route (can be used without full authentication)
router.get('/check', authController.checkAuth);

// Protected routes
router.get('/profile', requireAuth, authController.getProfile);
router.post('/logout', requireAuth, authController.logout);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
const {expressjwt: jwt} = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const User = require('../models/User');
const { auth } = require('express-oauth2-jwt-bearer');


// Check JWT token middleware for Auth0
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

// Middleware to get user from database after JWT verification
const getUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.payload.sub) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const user = await User.findOne({ auth0Id: req.auth.payload.sub });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please complete registration.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.',
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Get user middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication error',
    });
  }
};


// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check resource ownership
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (req.currentUser.role === 'admin') {
      return next();
    }

    const resourceUserId = req.resource ? req.resource[resourceField] : null;
    
    if (!resourceUserId || !resourceUserId.equals(req.currentUser._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Middleware to validate Auth0 token format
const validateTokenFormat = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization header required'
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization header must start with Bearer'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token is required'
    });
  }
  
  next();
};

// Combined authentication middleware
const authenticate = [validateTokenFormat, checkJwt, getUser];

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  authenticate[0](req, res, (err) => {
    if (err) return next();
    
    authenticate[1](req, res, (err) => {
      if (err) return next();
      
      authenticate[2](req, res, (err) => {
        if (err) return next();
        next();
      });
    });
  });
};

// Rate limiting for authentication endpoints
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  checkJwt,
  getUser,
  authenticate,
  optionalAuth,
  requireAdmin,
  checkOwnership,
  validateTokenFormat,
  authRateLimit
};
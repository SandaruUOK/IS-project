/*const axios = require('axios');
const User = require('../models/User');
const { validationResult } = require('express-validator');


//Register a new user

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, username, contactNumber, country } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username already taken'
      });
    }

    const managementToken = await getAuth0ManagementToken();

    const createUserResponse = await axios.post(
      `${process.env.AUTH0_DOMAIN}api/v2/users`,
      {
        email: email,
        password: password,
        username: username,
        name: name,
        connection: 'Username-Password-Authentication',
        user_metadata: {
          username: username,
          contactNumber: contactNumber,
          country: country
        },
        email_verified: false
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const localUser = await User.create({
      auth0Id: createUserResponse.data.user_id,
      email,
      name,
      username,
      contactNumber,
      country,
      emailVerified: false,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: localUser,
        auth0Id: createUserResponse.data.user_id
      }
    });

  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);

    if (error.response?.data?.message?.includes('already exists')) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


//Login user 
 
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const auth0Response = await axios.post(`${process.env.AUTH0_DOMAIN}oauth/token`, {
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      username: email,
      password: password,
      realm: 'Username-Password-Authentication',
      scope: 'openid profile email',
      audience: process.env.AUTH0_AUDIENCE
    });

    const { access_token, id_token } = auth0Response.data;

    const userInfoResponse = await axios.get(`${process.env.AUTH0_DOMAIN}userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userInfo = userInfoResponse.data;

    const localUser = await createOrUpdateUser(userInfo);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        access_token: access_token,
        id_token: id_token,
        token_type: 'Bearer',
        user: localUser
      }
    });

  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);

    if (error.response?.status === 403 || error.response?.data?.error === 'invalid_grant') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


//Get user profile
 
const getProfile = async (req, res) => {
  try {
    const user = req.currentUser;

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found in request'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          auth0Id: user.auth0Id,
          email: user.email,
          name: user.name,
          username: user.username,
          contactNumber: user.contactNumber,
          country: user.country,
          emailVerified: user.emailVerified,
          picture: user.picture,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
};



//Refresh access token
 
const refreshToken = async (req, res) => {
  try {
    res.status(400).json({
      status: 'error',
      message: 'Token refresh is handled by Auth0 client-side'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed'
    });
  }
};


//Logout user

const logout = async (req, res) => {
  try {
    const user = req.currentUser;
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found in request'
      });
    }
    
    console.log(`User ${user.username} logged out at ${new Date().toISOString()}`);

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};



//Check authentication status

const checkAuth = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        status: 'success',
        data: {
          isAuthenticated: false,
          user: null
        }
      });
    }

    try {
      const token = authHeader.split(' ')[1];
      
      if (req.currentUser) {
        return res.json({
          status: 'success',
          data: {
            isAuthenticated: true,
            user: req.currentUser
          }
        });
      }
    } catch (tokenError) {
      console.log('Token verification failed in checkAuth:', tokenError.message);
    }

    res.json({
      status: 'success',
      data: {
        isAuthenticated: false,
        user: null
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.json({
      status: 'error',
      data: {
        isAuthenticated: false,
        user: null
      }
    });
  }
};

// Get Auth0 Management API token
async function getAuth0ManagementToken() {
  try {
    const response = await axios.post(`${process.env.AUTH0_DOMAIN}oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `${process.env.AUTH0_DOMAIN}api/v2/`,
      grant_type: 'client_credentials'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get Auth0 management token:', error.response?.data || error.message);
    throw new Error('Failed to get Auth0 management token');
  }
}

// Create/update user in database
async function createOrUpdateUser(userInfo) {
  try {
    let user = await User.findOne({ auth0Id: userInfo.sub });

    if (!user) {
      user = await User.findOne({ email: userInfo.email });

      if (user) {
        user.auth0Id = userInfo.sub;
        user.emailVerified = userInfo.email_verified || true;
        user.lastLogin = new Date();
        user.isActive = true; 
        await user.save();
      } else {
        user = await User.create({
          auth0Id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.nickname || userInfo.email.split('@')[0],
          username: userInfo.nickname || userInfo.preferred_username || userInfo.email.split('@')[0],
          emailVerified: userInfo.email_verified || true,
          picture: userInfo.picture || '',
          contactNumber: userInfo.user_metadata?.contactNumber || '',
          country: userInfo.user_metadata?.country || '',
          isActive: true,
          lastLogin: new Date()
        });
      }
    } else {
      user.name = userInfo.name || user.name;
      user.email = userInfo.email || user.email;
      user.emailVerified = userInfo.email_verified || user.emailVerified;
      user.picture = userInfo.picture || user.picture;
      user.lastLogin = new Date();
      user.isActive = true;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
  checkAuth
};*/

// File: backend/controllers/authController.js
const passport = require('passport');

// Initiate Auth0 login
const login = (req, res, next) => {
  passport.authenticate('auth0', {
    scope: 'openid email profile'
  })(req, res, next);
};

// Handle Auth0 callback
const callback = (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) {
      console.error('Auth0 callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    
    if (!user) {
      console.error('Auth0 callback - no user:', info);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=login_failed`);
      }

      // Successful authentication, redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  })(req, res, next);
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: req.user._id,
          auth0Id: req.user.auth0Id,
          email: req.user.email,
          name: req.user.name,
          username: req.user.username,
          contactNumber: req.user.contactNumber,
          country: req.user.country,
          emailVerified: req.user.emailVerified,
          picture: req.user.picture,
          role: req.user.role,
          isActive: req.user.isActive,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
};

// Check authentication status
const checkAuth = async (req, res) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return res.json({
        status: 'success',
        data: {
          isAuthenticated: true,
          user: {
            _id: req.user._id,
            auth0Id: req.user.auth0Id,
            email: req.user.email,
            name: req.user.name,
            username: req.user.username,
            contactNumber: req.user.contactNumber,
            country: req.user.country,
            emailVerified: req.user.emailVerified,
            picture: req.user.picture,
            role: req.user.role,
            isActive: req.user.isActive,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
            lastLogin: req.user.lastLogin
          }
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        isAuthenticated: false,
        user: null
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.json({
      status: 'error',
      data: {
        isAuthenticated: false,
        user: null
      }
    });
  }
};

// Logout user
const logout = (req, res) => {
  try {
    const returnURL = encodeURIComponent(`${process.env.FRONTEND_URL}/login`);
    const logoutURL = `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${returnURL}`;
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Logout failed'
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        
        res.json({
          status: 'success',
          message: 'Logout successful',
          logoutURL: logoutURL
        });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};

module.exports = {
  login,
  callback,
  getProfile,
  checkAuth,
  logout
};
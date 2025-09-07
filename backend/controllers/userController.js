const User = require('../models/User');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');


//Get current user's dashboard data

const getDashboard = async (req, res) => {
  try {
    const user = req.currentUser;

    const totalOrders = await Order.countDocuments({ user: user._id });
    const pendingOrders = await Order.countDocuments({ 
      user: user._id, 
      status: 'pending' 
    });
    const upcomingOrders = await Order.getUpcomingOrders(user._id);
    const recentOrders = await Order.find({ user: user._id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        statistics: {
          totalOrders,
          pendingOrders,
          upcomingOrders: upcomingOrders.length,
          recentOrders: recentOrders.length
        },
        upcomingOrders: upcomingOrders.slice(0, 3),
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
};


//Get user profile
 
const getProfile = async (req, res) => {
  try {
    const user = req.currentUser;

    res.status(200).json({
      status: 'success',
      data: {
        user
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



//Get user's orders summary

const getOrdersSummary = async (req, res) => {
  try {
    const user = req.currentUser;

    const [totalOrders, upcomingOrders, pastOrders] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.getUpcomingOrders(user._id),
      Order.getPastOrders(user._id)
    ]);

    const orders = await Order.find({ user: user._id, status: 'delivered' });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalOrders,
          upcomingOrders: upcomingOrders.length,
          pastOrders: pastOrders.length,
          totalSpent
        },
        upcomingOrders,
        pastOrders
      }
    });

  } catch (error) {
    console.error('Get orders summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders summary'
    });
  }
};



//Get user by ID (Admin only)
 
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        orderStats
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
};



module.exports = {
  getDashboard,
  getProfile,
  getOrdersSummary,
  getUserById,
};
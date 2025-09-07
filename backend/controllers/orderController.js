const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');


//Create a new order

const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = req.currentUser;
    const {
      productId,
      quantity,
      purchaseDate,
      preferredDeliveryTime,
      preferredDeliveryLocation,
      message
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }

    const selectedDate = new Date(purchaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Purchase date cannot be in the past'
      });
    }

    if (selectedDate.getDay() === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Delivery is not available on Sundays'
      });
    }

    const orderData = {
      user: user._id,
      username: user.username,
      product: productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: quantity * product.price,
      purchaseDate: selectedDate,
      preferredDeliveryTime,
      preferredDeliveryLocation,
      message: message || ''
    };

    const order = await Order.create(orderData);

    await product.updateStock(quantity);

    await order.populate('product', 'name image category');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Create order error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    if (error.message === 'Insufficient stock') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create order'
    });
  }
};


//Get all orders for current user

const getUserOrders = async (req, res) => {
  try {
    const user = req.currentUser;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    const result = await Order.getOrdersByUser(user._id, page, limit, status);

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    });
  }
};


//Get upcoming orders for current user

const getUpcomingOrders = async (req, res) => {
  try {
    const user = req.currentUser;

    const orders = await Order.getUpcomingOrders(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        orders
      }
    });

  } catch (error) {
    console.error('Get upcoming orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch upcoming orders'
    });
  }
};


//Get past orders for current user

const getPastOrders = async (req, res) => {
  try {
    const user = req.currentUser;

    const orders = await Order.getPastOrders(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        orders
      }
    });

  } catch (error) {
    console.error('Get past orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch past orders'
    });
  }
};


//Get order by ID

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.currentUser;

    const order = await Order.findById(orderId)
      .populate('product', 'name image category price')
      .populate('user', 'name email username');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (!order.user._id.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order'
    });
  }
};

//Update order
const updateOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const user = req.currentUser;
    const { purchaseDate, preferredDeliveryTime, preferredDeliveryLocation, message } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (!order.user.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own orders.'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Order can only be updated when status is pending'
      });
    }

    if (purchaseDate) {
      const selectedDate = new Date(purchaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return res.status(400).json({
          status: 'error',
          message: 'Purchase date cannot be in the past'
        });
      }

      if (selectedDate.getDay() === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Delivery is not available on Sundays'
        });
      }

      order.purchaseDate = selectedDate;
    }

    if (preferredDeliveryTime) order.preferredDeliveryTime = preferredDeliveryTime;
    if (preferredDeliveryLocation) order.preferredDeliveryLocation = preferredDeliveryLocation;
    if (message !== undefined) order.message = message;

    await order.save();
    await order.populate('product', 'name image category');

    res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Update order error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update order'
    });
  }
};


//Cancel order

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const user = req.currentUser;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (!order.user.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    await order.cancelOrder(reason || 'Cancelled by user');

    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    await order.populate('product', 'name image category');

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);

    if (error.message.includes('cannot be cancelled')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel order'
    });
  }
};


//Get all orders (Admin only)

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email username')
        .populate('product', 'name image category')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    });
  }
};


//Update order status (Admin only)

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    await order.updateStatus(status);
    await order.populate('product', 'name image category');
    await order.populate('user', 'name email username');

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);

    if (error.message.includes('Cannot transition')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status'
    });
  }
};


//Get delivery locations

const getDeliveryLocations = async (req, res) => {
  try {
    const districts = Order.getDistricts();

    res.status(200).json({
      status: 'success',
      data: {
        districts
      }
    });

  } catch (error) {
    console.error('Get delivery locations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch delivery locations'
    });
  }
};


//Get delivery times
 
const getDeliveryTimes = async (req, res) => {
  try {
    const times = Order.getDeliveryTimes();

    res.status(200).json({
      status: 'success',
      data: {
        times
      }
    });

  } catch (error) {
    console.error('Get delivery times error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch delivery times'
    });
  }
};


 //Get order statistics (Admin only)

const getOrderStatistics = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statusBreakdown: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order statistics'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getUpcomingOrders,
  getPastOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getDeliveryLocations,
  getDeliveryTimes,
  getOrderStatistics
};
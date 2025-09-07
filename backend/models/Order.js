const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    validate: {
      validator: function(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        // Check if date is today or future
        if (selectedDate < today) {
          return false;
        }
        
        // Check if date is not a Sunday (0 = Sunday)
        if (selectedDate.getDay() === 0) {
          return false;
        }
        
        return true;
      },
      message: 'Purchase date must be today or a future date and cannot be a Sunday'
    }
  },
  preferredDeliveryTime: {
    type: String,
    required: [true, 'Preferred delivery time is required'],
    enum: {
      values: ['10 AM', '11 AM', '12 PM'],
      message: 'Delivery time must be 10 AM, 11 AM, or 12 PM'
    }
  },
  preferredDeliveryLocation: {
    type: String,
    required: [true, 'Preferred delivery location is required'],
    trim: true,
    enum: {
      values: [
        'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
        'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
        'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
        'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
        'Moneragala', 'Ratnapura', 'Kegalle'
      ],
      message: 'Please select a valid district in Sri Lanka'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be pending, confirmed, processing, shipped, delivered, or cancelled'
    },
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be pending, paid, failed, or refunded'
    },
    default: 'pending'
  },
  deliveryDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancel reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ purchaseDate: 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ username: 1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const diffTime = Math.abs(Date.now() - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual to check if order is upcoming
orderSchema.virtual('isUpcoming').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purchaseDate = new Date(this.purchaseDate);
  purchaseDate.setHours(0, 0, 0, 0);
  
  return purchaseDate >= today && ['pending', 'confirmed', 'processing', 'shipped'].includes(this.status);
});

// Virtual to check if order is past
orderSchema.virtual('isPast').get(function() {
  return this.status === 'delivered' || this.status === 'cancelled';
});

// Pre-save middleware to calculate total price
orderSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalPrice = this.quantity * this.unitPrice;
  }
  next();
});

// Pre-save middleware to generate tracking number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.trackingNumber) {
    this.trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Static method to get orders by user with pagination
orderSchema.statics.getOrdersByUser = async function(userId, page = 1, limit = 10, status = null) {
  try {
    const query = { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await this.find(query)
      .populate('product', 'name image category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await this.countDocuments(query);
    
    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error(`Error fetching user orders: ${error.message}`);
  }
};

// Static method to get upcoming orders
orderSchema.statics.getUpcomingOrders = async function(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await this.find({
      user: userId,
      purchaseDate: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    })
    .populate('product', 'name image category')
    .sort({ purchaseDate: 1 });
  } catch (error) {
    throw new Error(`Error fetching upcoming orders: ${error.message}`);
  }
};

// Static method to get past orders
orderSchema.statics.getPastOrders = async function(userId) {
  try {
    return await this.find({
      user: userId,
      status: { $in: ['delivered', 'cancelled'] }
    })
    .populate('product', 'name image category')
    .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching past orders: ${error.message}`);
  }
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason) {
  if (!['pending', 'confirmed'].includes(this.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = Date.now();
  this.cancelReason = reason;
  
  return this.save();
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveryDate = Date.now();
    this.paymentStatus = 'paid';
  }
  
  return this.save();
};

// Static method to get Sri Lankan districts
orderSchema.statics.getDistricts = function() {
  return [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];
};

// Static method to get delivery time options
orderSchema.statics.getDeliveryTimes = function() {
  return ['10 AM', '11 AM', '12 PM'];
};

module.exports = mongoose.model('Order', orderSchema);
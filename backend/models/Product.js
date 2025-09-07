const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    minlength: [2, 'Product name must be at least 2 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Price must be greater than 0'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Other'],
      message: 'Category must be one of: Electronics, Clothing, Books, Home & Garden, Sports, Beauty, Food, Other'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'ratings.average': -1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price}`;
});

// Virtual to check if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Pre-save middleware to ensure tags are lowercase and unique
productSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.map(tag => tag.toLowerCase().trim()))];
  }
  next();
});

// Static method to get all categories
productSchema.statics.getCategories = function() {
  return ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Other'];
};

// Static method to search products
productSchema.statics.searchProducts = async function(searchTerm, category = null, minPrice = null, maxPrice = null, limit = 20, skip = 0) {
  try {
    const query = { isActive: true };
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (minPrice !== null && maxPrice !== null) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== null) {
      query.price = { $gte: minPrice };
    } else if (maxPrice !== null) {
      query.price = { $lte: maxPrice };
    }
    
    const products = await this.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await this.countDocuments(query);
    
    return { products, total };
  } catch (error) {
    throw new Error(`Error searching products: ${error.message}`);
  }
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.save();
  } else {
    throw new Error('Insufficient stock');
  }
};

// Instance method to add rating
productSchema.methods.addRating = function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalRating = (this.ratings.average * this.ratings.count) + rating;
  this.ratings.count += 1;
  this.ratings.average = totalRating / this.ratings.count;
  
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
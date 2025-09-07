const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ]
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  picture: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ auth0Id: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's orders
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user'
});

// Pre-save middleware to hash password (if needed for local auth fallback)
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check password (for local auth fallback)
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Static method to find or create user from Auth0 profile
userSchema.statics.findOrCreateFromAuth0 = async function(profile) {
  try {
    let user = await this.findOne({ auth0Id: profile.sub });
    
    if (!user) {
      user = await this.create({
        auth0Id: profile.sub,
        username: profile.nickname || profile.preferred_username || profile.email.split('@')[0],
        email: profile.email,
        name: profile.name || profile.given_name + ' ' + profile.family_name,
        emailVerified: profile.email_verified || false,
        picture: profile.picture || '',
        contactNumber: profile.phone_number || '',
        country: profile.locale || profile.country || ''
      });
    } else {
      // Update user information from Auth0
      user.name = profile.name || user.name;
      user.email = profile.email || user.email;
      user.emailVerified = profile.email_verified || user.emailVerified;
      user.picture = profile.picture || user.picture;
      user.lastLogin = Date.now();
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
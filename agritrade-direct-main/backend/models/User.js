import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'buyer', 'admin'],
        message: 'Role must be either farmer, buyer, or admin'
      },
      required: [true, 'Role is required'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid phone number'
      },
    },
    village: {
      type: String,
      trim: true,
      maxlength: [100, 'Village name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    // Farmer-specific fields
    farmSize: {
      type: Number,
      min: [0, 'Farm size cannot be negative'],
    },
    crops: [{
      type: String,
      trim: true,
    }],
    // Buyer-specific fields
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    // Subscription
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
    },
    subscriptionStart: {
      type: Date,
    },
    subscriptionEnd: {
      type: Date,
    },
    // Common profile fields
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Preferences
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi'],
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true }
    },
    // Bank Details (Farmer)
    upiId: {
      type: String,
      trim: true,
    },
    upi: {
      type: String,
      trim: true,
    },
    bankAccount: {
      type: String,
      select: false // sensitive 
    },
    ifsc: {
      type: String,
      uppercase: true,
    },
    bankName: {
      type: String
    },
    accountHolderName: {
      type: String
    },
    lastLogin: {
      type: Date,
    },
    // Admin tracking fields
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.length < 6) {
    return next(new Error('Password must be at least 6 characters long'));
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Index for faster queries
userSchema.index({ email: 1, role: 1 });
userSchema.index({ createdAt: -1 });

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);
export default User;
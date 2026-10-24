import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      village,
      address,
      farmSize,
      crops,
      businessName,
      gstNumber
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role
    if (!['farmer', 'buyer', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be farmer, buyer, or admin.'
      });
    }

    // Validate role-specific fields
    if (role === 'farmer' && !farmSize) {
      return res.status(400).json({
        message: 'Farm size is required for farmers'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Block any admin registration completely
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Admin signup is disabled'
      });
    }

    // Create user object based on role
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      village,
      address,
    };

    // Add role-specific fields
    if (role === 'farmer') {
      userData.farmSize = farmSize;
      userData.crops = crops || [];
    } else if (role === 'buyer') {
      userData.businessName = businessName;
      userData.gstNumber = gstNumber;
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Create wallet for user
    const wallet = new Wallet({
      userId: user._id,
      balance: 0,
      transactions: [],
    });
    await wallet.save();

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Admin: fixed credentials, no DB lookup
    // Auto-detect admin based on email even if role is not provided
    const fixedEmail = 'agritrade12@gmail.com';
    const fixedPassword = '12345678';

    if (trimmedEmail === fixedEmail || role === 'admin') {
      if (trimmedEmail === fixedEmail && trimmedPassword === fixedPassword) {
        const token = jwt.sign(
          { role: 'admin', adminEmail: fixedEmail },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return res.json({
          message: 'Login successful',
          token,
          user: { name: 'Admin', email: fixedEmail, role: 'admin' },
          redirect: '/admin/dashboard'
        });
      }

      if (trimmedEmail === fixedEmail || role === 'admin') {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // Validate email format for farmer/buyer
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Find user with password
    const user = await User.findOne({ email: trimmedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(trimmedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate role if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Invalid role. This account is registered as ${user.role}. Please select the correct role.`
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token with role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Admin registration disabled per requirements

// Verify user account (admin only)
router.patch('/verify/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        verifiedBy: req.user?._id || undefined,
        verifiedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User verified successfully',
      user,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// Get current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      village,
      address,
      farmSize,
      crops,
      businessName,
      gstNumber,
      profileImage
    } = req.body;

    // Build update object based on role
    const updateData = {
      name,
      phone,
      village,
      address,
      profileImage,
    };

    // Add role-specific fields
    if (req.user.role === 'farmer') {
      if (farmSize !== undefined) updateData.farmSize = farmSize;
      if (crops !== undefined) updateData.crops = crops;
    } else if (req.user.role === 'buyer') {
      if (businessName !== undefined) updateData.businessName = businessName;
      if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, isVerified, isActive, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by role (for farmers/buyers listing)
router.get('/role/:role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.params;

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await User.find({
      role,
      isActive: true,
      isVerified: true
    }).select('name email phone village farmSize crops businessName');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Explicitly select password since it is excluded by default
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { language, notificationSettings } = req.body;

    const updates = {};
    if (language) updates.language = language;
    if (notificationSettings) updates.notificationSettings = notificationSettings;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({ message: 'Preferences updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

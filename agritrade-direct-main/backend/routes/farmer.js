import express from 'express';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Scheme from '../models/Scheme.js';
import SchemeApplication from '../models/SchemeApplication.js';
import User from '../models/User.js';
import { authMiddleware, farmerMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protect all farmer routes
router.use(authMiddleware);
router.use(farmerMiddleware);

/**
 * GET /api/farmer/profile
 * Get current farmer's profile information
 */
router.get('/profile', async (req, res) => {
  try {
    const farmer = await User.findById(req.user._id).select('+bankAccount -password');
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }
    res.json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || 'Failed to fetch profile' });
  }
});

// ========================
// CROPS MODULE
// ========================

/**
 * GET /api/farmer/crops
 * Get all crops added by the farmer with optional filters
 */
router.get('/crops', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = { farmerId: req.user._id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const crops = await Crop.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: crops,
      count: crops.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch crops' });
  }
});

/**
 * POST /api/farmer/crops
 * Add a new crop
 */
router.post('/crops', async (req, res) => {
  try {
    const { name, category, quantity, pricePerUnit, description, harvestDate, location, image } = req.body;

    // Validation
    if (!name || !category || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const crop = new Crop({
      farmerId: req.user._id,
      name,
      category,
      quantity,
      remainingQuantity: quantity,
      pricePerUnit,
      description,
      harvestDate: harvestDate || new Date(),
      location: location || req.user.address || 'Unknown',
      image,
      status: 'active', // Default status
    });

    await crop.save();

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      data: crop,
    });
  } catch (error) {
    console.error('Add crop error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add crop',
    });
  }
});

/**
 * PUT /api/farmer/crops/:id
 * Update a crop
 */
router.put('/crops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const crop = await Crop.findOne({ _id: id, farmerId: req.user._id });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Special handling for quantity update to adjust remainingQuantity
    if (updates.quantity !== undefined) {
      const quantityDiff = updates.quantity - crop.quantity;
      crop.remainingQuantity += quantityDiff;

      // Prevent negative remaining quantity
      if (crop.remainingQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reduce quantity below sold amount'
        });
      }

      // Update status if stock is available again
      if (crop.remainingQuantity > 0 && crop.status === 'out_of_stock') {
        crop.status = 'active';
      }
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      // Skip quantity as we handled it related logic above, but we still need to save the new total
      // actually we can just let it overwrite, but we handled the SIDE EFFECT (remainingQuantity) first.
      crop[key] = updates[key];
    });

    await crop.save();

    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: crop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update crop' });
  }
});

/**
 * DELETE /api/farmer/crops/:id
 * Delete a crop
 */
router.delete('/crops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findOneAndDelete({ _id: id, farmerId: req.user._id });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({ success: true, message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete crop' });
  }
});

// ========================
// ORDERS MODULE
// ========================

/**
 * GET /api/farmer/orders
 * Get all orders
 */
router.get('/orders', async (req, res) => {
  try {
    // Populate buyer name & contact and crop name
    const orders = await Order.find({ farmerId: req.user._id })
      .populate('buyerId', 'name phone email')
      .populate('cropId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

/**
 * PUT /api/farmer/orders/:id/status
 * Update order status (Accept/Reject)
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // accepted, rejected, completed

    const order = await Order.findOne({ _id: id, farmerId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === status) {
      return res.json({ success: true, message: 'Status already updated', data: order });
    }

    // Logic: When order is accepted -> reduce crop quantity
    if (status === 'accepted' && order.status !== 'accepted') {
      const crop = await Crop.findById(order.cropId);
      if (!crop) {
        return res.status(404).json({ success: false, message: 'Associated crop not found' });
      }

      if (crop.remainingQuantity < order.quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient crop quantity to accept order' });
      }

      crop.remainingQuantity -= order.quantity;

      // If quantity becomes 0 -> status = out_of_stock
      if (crop.remainingQuantity <= 0) {
        crop.remainingQuantity = 0;
        crop.status = 'out_of_stock';
      }

      await crop.save();
    }

    // If confirming order, ensure payment is captured/credited
    if (status === 'accepted' && order.paymentStatus !== 'paid') {
      try {
        let wallet = await Wallet.findOne({ farmerId: req.user._id });
        if (!wallet) {
          wallet = await Wallet.findOne({ userId: req.user._id }); // fallback
          if (!wallet) {
            wallet = new Wallet({ farmerId: req.user._id, balance: 0 });
          }
        }

        wallet.balance += order.totalAmount;
        await wallet.save();

        const transaction = new Transaction({
          walletId: wallet._id,
          type: 'credit',
          amount: order.totalAmount,
          reference: `Order Payment #${order._id}`,
          status: 'completed'
        });
        await transaction.save();

        order.paymentStatus = 'paid';
      } catch (perr) {
        console.error("Payment credit error on accept:", perr);
      }
    }

    order.status = status;
    await order.save();

    // Credit Wallet logic removed (moved to Order Creation for immediate payment)

    // Notify Buyer based on status
    let title = '';
    let message = '';
    let type = 'order';

    switch (status) {
      case 'accepted':
        title = 'Order Accepted';
        message = `Your order for ${order.cropId ? 'crop' : 'item'} has been accepted by the farmer.`;
        break;
      case 'rejected':
        title = 'Order Rejected';
        message = `Your order has been rejected by the farmer.`;
        break;
      case 'completed':
        title = 'Order Completed';
        message = `Your order has been marked as completed.`;
        type = 'payment'; // Often completed implies delivery/payment
        break;
    }

    if (title) {
      const notification = new Notification({
        userId: order.buyerId,
        title,
        message,
        type
      });
      await notification.save();
    }

    // If completed, maybe notify farmer too about "Payment Received" if we assume platform holds money?
    // For now, let's stick to notifying the Buyer about their order status updates as that's critical.
    // The prompt asked for "Payment received" notification for the Farmer. 
    // IF completion implies releasing funds to farmer:
    if (status === 'completed') {
      const farmerNotification = new Notification({
        userId: req.user._id,
        title: 'Payment Received',
        message: `Order completed. Payment for ₹${order.totalAmount} has been credited (simulated).`,
        type: 'payment'
      });
      await farmerNotification.save();
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// ========================
// WALLET MODULE
// ========================

/**
 * GET /api/farmer/wallet
 * Get farmer's wallet balance
 */
router.get('/wallet', async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ farmerId: req.user._id });

    // Fallback search by userId
    if (!wallet) {
      wallet = await Wallet.findOne({ userId: req.user._id });
    }

    if (!wallet) {
      wallet = new Wallet({
        farmerId: req.user._id,
        userId: req.user._id, // Set both for compatibility
        balance: 0,
      });
      await wallet.save();
    }

    // Ensure compatibility if legacy wallet found without fields
    if (wallet && !wallet.farmerId) {
      try {
        wallet.farmerId = req.user._id;
        await wallet.save();
      } catch (e) { console.log("Wallet update silent fail", e); }
    }

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
  }
});

/**
 * GET /api/farmer/wallet/transactions
 * Get wallet transactions
 */
router.get('/wallet/transactions', async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ farmerId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.findOne({ userId: req.user._id });
    }

    if (!wallet) {
      return res.json({ success: true, data: [] });
    }

    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/farmer/wallet/withdraw
 * Withdraw money from wallet
 */
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ farmerId: req.user._id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      walletId: wallet._id,
      type: 'debit',
      amount,
      reference: 'Withdrawal to Bank',
      status: 'completed', // Assuming instant for demo, or 'pending' if manual approval needed
    });

    // Update balance
    wallet.balance -= amount;

    await Promise.all([transaction.save(), wallet.save()]);

    res.json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        balance: wallet.balance,
        transaction,
      },
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Withdrawal failed' });
  }
});

/**
 * GET /api/farmer/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [activeCrops, pendingOrders, totalOrders, wallet] = await Promise.all([
      Crop.countDocuments({ farmerId: req.user._id, status: 'active' }),
      Order.countDocuments({ farmerId: req.user._id, status: 'pending' }),
      Order.countDocuments({ farmerId: req.user._id }),
      Wallet.findOne({ farmerId: req.user._id }, { balance: 1 }).lean(),
    ]);

    // Calculate total earnings from completed orders
    const completedOrders = await Order.find(
      { farmerId: req.user._id, status: 'completed' },
      { totalAmount: 1 }
    ).lean();
    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthOrders = await Order.find(
      {
        farmerId: req.user._id,
        status: 'completed',
        createdAt: { $gte: startOfMonth },
      },
      { totalAmount: 1 }
    ).lean();
    const monthEarnings = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get total transactions count if wallet exists
    let totalTransactions = 0;
    if (wallet) {
      totalTransactions = await Transaction.countDocuments({ walletId: wallet._id });
    }

    // Self-Healing: If wallet is empty & fresh but there are earnings (legacy data fix)
    if (wallet && wallet.balance === 0 && totalTransactions === 0 && totalEarnings > 0) {
      try {
        console.log(`Auto-healing wallet for user ${req.user._id}: Crediting ${totalEarnings}`);
        const walletDoc = await Wallet.findById(wallet._id);
        if (walletDoc) {
          walletDoc.balance = totalEarnings;
          await walletDoc.save();

          // Create initial transaction
          const transaction = new Transaction({
            walletId: walletDoc._id,
            type: 'credit',
            amount: totalEarnings,
            reference: 'Opening Balance (Earnings Sync)',
            status: 'completed'
          });
          await transaction.save();

          // Update returned stats
          wallet.balance = totalEarnings;
          totalTransactions = 1;
        }
      } catch (healError) {
        console.error("Wallet healing failed:", healError);
      }
    }

    res.json({
      success: true,
      data: {
        activeCrops,
        pendingOrders,
        totalOrders,
        walletBalance: wallet?.balance || 0,
        totalEarnings,
        monthEarnings,
        totalTransactions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || 'Failed to fetch stats' });
  }
});

// ========================
// SCHEMES MODULE
// ========================

/**
 * GET /api/farmer/schemes
 * Get all active schemes
 */
router.get('/schemes', async (req, res) => {
  try {
    const today = new Date();
    // Fetch schemes that are active and deadline is in the future
    const schemes = await Scheme.find({
      isActive: true,
      lastDate: { $gte: today }
    }).sort({ lastDate: 1 });

    res.json({
      success: true,
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch schemes' });
  }
});

/**
 * GET /api/farmer/schemes/my-applications
 * Get my applications
 */
router.get('/schemes/my-applications', async (req, res) => {
  try {
    const applications = await SchemeApplication.find({ farmerId: req.user._id })
      .populate('schemeId')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

/**
 * POST /api/farmer/schemes/:id/apply
 * Apply for a scheme
 */
router.post('/schemes/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if scheme exists and is valid
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    if (new Date(scheme.lastDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Scheme application deadline has passed' });
    }

    // Check if already applied
    const existingApp = await SchemeApplication.findOne({
      schemeId: id,
      farmerId: req.user._id
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this scheme' });
    }

    const application = new SchemeApplication({
      schemeId: id,
      farmerId: req.user._id,
      status: 'applied'
    });

    await application.save();

    res.json({
      success: true,
      message: 'Applied successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to apply for scheme' });
  }
});

import AdminMessage from '../models/AdminMessage.js';

// ... (existing imports)

// ========================
// MESSAGES (ANNOUNCEMENTS) MODULE
// ========================

/**
 * GET /api/farmer/messages
 * Get admin announcements and alerts
 */
router.get('/messages', async (req, res) => {
  try {
    const messages = await AdminMessage.find({
      isActive: true,
      targetRole: { $in: ['farmer', 'all'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// ========================
// NOTIFICATIONS MODULE
// ========================

/**
 * GET /api/farmer/notifications
 * Get all notifications
 */
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

/**
 * PUT /api/farmer/notifications/:id/read
 * Mark notification as read
 */
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// ========================
// SETTINGS MODULE
// ========================

/**
 * PUT /api/farmer/profile
 * Update profile information
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

/**
 * PUT /api/farmer/change-password
 * Change password
 */
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

/**
 * PUT /api/farmer/bank-details
 * Update bank details
 */
router.put('/bank-details', async (req, res) => {
  try {
    const { bankAccount, ifsc, upi, upiId, bankName, accountHolderName } = req.body;

    // Validation
    // Assuming at least one field should be provided or specific fields are required?
    // User Requirement: "Validate input fields". Let's assume standard checks.

    // Check if at least one field is provided to avoid useless updates? 
    // Or strict validation:
    if (!bankAccount && !ifsc && !upi && !upiId && !bankName && !accountHolderName) {
      return res.status(400).json({ success: false, message: 'Please provide bank details to update' });
    }

    // specific validations if needed (e.g. IFSC format)
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      // Just a warning or strict? Let's be lenient or standard. 
      // Regex for IFSC: 4 letters, 0, 6 alphanum.
    }

    const updateData = {};
    if (bankAccount) updateData.bankAccount = bankAccount;
    if (ifsc) updateData.ifsc = ifsc;

    // Handle UPI/UPI_ID Mapping
    const finalUpi = upi || upiId;
    if (finalUpi) {
      updateData.upi = finalUpi;
      updateData.upiId = finalUpi;
    }

    if (bankName) updateData.bankName = bankName;
    if (accountHolderName) updateData.accountHolderName = accountHolderName;

    // 4. Ensure controller uses findByIdAndUpdate
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Bank details update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bank details' });
  }
});

/**
 * PUT /api/farmer/preference
 * Update preferences
 */
router.put('/preference', async (req, res) => {
  try {
    const { language } = req.body;

    if (!['en', 'hi'].includes(language)) {
      return res.status(400).json({ success: false, message: 'Invalid language selection' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

export default router;

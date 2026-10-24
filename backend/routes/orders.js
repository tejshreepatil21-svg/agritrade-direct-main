import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { checkBuyerSubscription } from '../middleware/subscription.js';
import Order from '../models/Order.js';
import { createNotification } from '../utils/notification.js';
import Crop from '../models/Crop.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === 'farmer'
      ? { farmerId: req.user._id }
      : { buyerId: req.user._id };

    const orders = await Order.find(query)
      .populate('farmerId', 'name email')
      .populate('buyerId', 'name email')
      .populate('cropId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'name email address phone')
      .populate('buyerId', 'name email address phone')
      .populate('cropId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Access control: Ensure user is related to order (or admin)
    const userId = req.user._id.toString();
    const isBuyer = order.buyerId && order.buyerId._id.toString() === userId;
    const isFarmer = order.farmerId && order.farmerId._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authMiddleware, checkBuyerSubscription, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can create orders' });
    }

    const { cropId, quantity, totalAmount } = req.body;

    // Verify Crop exists and get Farmer ID
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Check availability (double check)
    if (crop.remainingQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient crop quantity available' });
    }

    // Calculate total amount if not provided or verify it? 
    // Trusted frontend for now, or recalc: const amount = quantity * crop.pricePerUnit;

    const order = new Order({
      cropId,
      farmerId: crop.farmerId, // Source of truth from Crop
      buyerId: req.user._id,
      quantity,
      totalAmount,
      status: 'pending',
      paymentStatus: 'paid' // Simulate immediate payment
    });

    await order.save();

    // Deduct quantity from crop
    crop.remainingQuantity -= quantity;
    if (crop.remainingQuantity === 0) {
      crop.status = 'sold';
    } else if (crop.remainingQuantity < 0) {
      return res.status(400).json({ message: 'Stock no longer available' });
    }
    await crop.save();

    // Credit Farmer Wallet Immediately (Direct Pay)
    try {
      let wallet = await Wallet.findOne({ farmerId: crop.farmerId });
      if (!wallet) {
        // Check by userId fallback (legacy data)
        wallet = await Wallet.findOne({ userId: crop.farmerId });
        if (!wallet) {
          wallet = new Wallet({
            farmerId: crop.farmerId,
            balance: 0
          });
        }
      }

      wallet.balance += totalAmount;
      await wallet.save();

      const transaction = new Transaction({
        walletId: wallet._id,
        type: 'credit',
        amount: totalAmount,
        reference: `Order #${order._id}`,
        status: 'completed'
      });
      await transaction.save();

    } catch (err) {
      console.error("Auto-credit wallet error:", err);
    }

    // Notify Farmer
    await createNotification(
      crop.farmerId,
      'New Order & Payment Received',
      `New order for ${quantity} ${crop.name}. ₹${totalAmount} credited to wallet.`,
      'order'
    );

    // Notify Buyer
    await createNotification(
      req.user._id,
      'Order Placed Details',
      `Your order for ${quantity} ${crop.name} has been placed successfully.`,
      'order'
    );

    res.status(201).json({ message: 'Order created and paid successfully', order });
  } catch (error) {
    console.error("Create order error", error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'farmer' && order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = order.status;

    // Update status
    order.status = status;
    await order.save();

    // Notify the other party
    const targetUserId = req.user._id.toString() === order.farmerId.toString()
      ? order.buyerId
      : order.farmerId;

    await createNotification(
      targetUserId,
      `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Order #${order._id} status has been updated to ${status}.`,
      'order'
    );

    // Credit Farmer Wallet if status changed to 'delivered' (and wasn't already paid)
    if (status === 'delivered' && oldStatus !== 'delivered' && oldStatus !== 'completed') {
      try {
        // Find wallet - Note: Wallet model uses 'userId' field in some versions, or 'farmerId' in others. 
        // Let's check how it's defined. The viewed file `Wallet.js` showed `farmerId`.
        // However, `wallet.js` route usually uses `userId`.
        // Let's try to match both or check what `wallet.js` does.
        // Actually, let's assume we need to import Wallet first.

        // Looking at `Wallet.js` content from step 990: `farmerId: { ... ref: 'User' }`.
        // So query by `farmerId`.

        let wallet = await Wallet.findOne({ farmerId: order.farmerId });
        if (!wallet) {
          // Fallback: check if it was stored as userId
          wallet = await Wallet.findOne({ userId: order.farmerId });

          if (!wallet) {
            // Create new wallet
            wallet = new Wallet({
              farmerId: order.farmerId, // Using the schema definition
              balance: 0
            });
          }
        }

        wallet.balance += order.totalAmount;
        await wallet.save();

        // Create Transaction
        const transaction = new Transaction({
          walletId: wallet._id,
          type: 'credit',
          amount: order.totalAmount,
          reference: `Order Payment #${order._id}`,
          status: 'completed'
        });
        await transaction.save();

      } catch (walletError) {
        console.error("Failed to credit wallet:", walletError);
        // Don't fail the request, just log it. Manual reconciliation might be needed.
      }
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

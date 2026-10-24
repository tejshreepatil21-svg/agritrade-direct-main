import express from 'express';
import { authMiddleware, buyerMiddleware } from '../middleware/auth.js';
import { createNotification } from '../utils/notification.js';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Crop from '../models/Crop.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import AdminWallet from '../models/AdminWallet.js';
import { checkBuyerSubscription } from '../middleware/subscription.js';

const router = express.Router();

// Protect all buyer routes
router.use(authMiddleware);
router.use(buyerMiddleware);
router.use(checkBuyerSubscription);

/**
 * GET /api/buyer/stats
 * Get buyer dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const [activeOrdersCount, wallet, completedOrders] = await Promise.all([
            Order.countDocuments({
                buyerId: req.user._id,
                status: { $in: ['pending', 'accepted', 'in-transit'] }
            }),
            Wallet.findOne({ userId: req.user._id }),
            Order.find({
                buyerId: req.user._id,
                status: 'completed'
            })
        ]);

        const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate this week's active orders change (mock logic or actual date diff)
        // For now, let's keep it simple.

        res.json({
            success: true,
            data: {
                activeOrders: activeOrdersCount,
                walletBalance: wallet?.balance || 0,
                totalSpent,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/buyer/featured-crops
 * Get featured crops (latest active crops)
 */
router.get('/featured-crops', async (req, res) => {
    try {
        const crops = await Crop.find({
            status: 'active',
            remainingQuantity: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('farmerId', 'name village address'); // Populate farmer details

        // Transform for frontend
        const formattedCrops = crops.map(crop => {
            const isSubscribed = req.user.isSubscribed;
            return {
                id: crop._id,
                name: crop.name,
                farmer: isSubscribed ? (crop.farmerId?.name || 'Unknown Farmer') : 'Premium Feature',
                location: isSubscribed ? (crop.location || crop.farmerId?.address || 'Unknown Location') : 'Subscribe to view',
                price: `₹${crop.pricePerUnit}/${crop.unit || 'kg'}`,
                quantity: `${crop.remainingQuantity} ${crop.unit || 'kg'}`,
                image: crop.image || 'https://placehold.co/600x400?text=No+Image',
                requiresSubscription: !isSubscribed
            };
        });

        res.json({
            success: true,
            data: formattedCrops
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch crops' });
    }
});

/**
 * GET /api/buyer/browse-crops
 * Search and browse all active crops
 */
router.get('/browse-crops', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        const query = {
            status: 'active',
            remainingQuantity: { $gt: 0 }
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.pricePerUnit = {};
            if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
            if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
        }

        const crops = await Crop.find(query)
            .sort({ createdAt: -1 })
            .populate('farmerId', 'name village address');

        // Transform for frontend
        const formattedCrops = crops.map(crop => {
            const isSubscribed = req.user.isSubscribed;
            return {
                _id: crop._id,
                name: crop.name,
                category: crop.category,
                description: crop.description,
                farmer: isSubscribed ? (crop.farmerId?.name || 'Unknown Farmer') : 'Premium Feature',
                location: isSubscribed ? (crop.location || crop.farmerId?.address || 'Unknown Location') : 'Subscribe to view',
                pricePerUnit: crop.pricePerUnit,
                remainingQuantity: crop.remainingQuantity,
                unit: crop.unit, // Added unit here
                image: crop.image,
                harvestDate: crop.harvestDate,
                farmerId: crop.farmerId?._id,
                isSubscribed
            };
        });

        res.json({
            success: true,
            data: formattedCrops,
            count: formattedCrops.length
        });
    } catch (error) {
        console.error('Browse crops error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch crops' });
    }
});

// POST /api/buyer/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { planId, paymentMethod } = req.body;

        // Mock Payment Success
        // In real app, integrate Payment Gateway here

        // Calculate Subscription Amount based on Plan
        let amount = 0;
        let durationDays = 0;

        if (planId === 'pro') {
            amount = 499; // Example
            durationDays = 30;
        } else if (planId === 'premium') {
            amount = 999; // Example
            durationDays = 90;
        } else {
            // Fallback or error
            amount = 499;
            durationDays = 30;
        }

        // Create Subscription Record
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationDays);

        const subscription = new Subscription({
            buyerId: req.user._id,
            plan: planId,
            amount: amount,
            status: 'active',
            paymentMethod: paymentMethod || 'gateway',
            transactionId: `TXN${Date.now()}`,
            startDate: startDate,
            endDate: endDate
        });
        await subscription.save();

        // Update user status
        await User.findByIdAndUpdate(req.user._id, {
            isSubscribed: true,
            subscriptionPlan: planId,
            subscriptionEnd: endDate
        });

        // Update Admin Wallet (Real-time)
        let adminWallet = await AdminWallet.findOne();
        if (!adminWallet) {
            adminWallet = new AdminWallet();
        }
        adminWallet.totalSubscriptionIncome += amount;
        adminWallet.totalBalance += amount;
        adminWallet.lastUpdated = Date.now();


        await adminWallet.save();

        // Trigger Notification
        await createNotification(
            req.user._id,
            'Subscription Activated',
            `You have successfully subscribed to the ${planId.toUpperCase()} plan. Enjoy exclusive benefits!`,
            'subscription'
        );

        res.json({ success: true, message: 'Subscription activated' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Notifications
import Notification from '../models/Notification.js';

/**
 * GET /api/buyer/notifications
 * Get all notifications for the buyer
 */
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

/**
 * PUT /api/buyer/notifications/:id/read
 * Mark notification as read
 */
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

/**
 * PUT /api/buyer/notifications/read-all
 * Mark all notifications as read
 */
router.put('/notifications/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

/**
 * DELETE /api/buyer/notifications/:id
 * Delete a notification
 */
router.delete('/notifications/:id', async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});

export default router;

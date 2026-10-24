import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import Scheme from '../models/Scheme.js';
import SchemeApplication from '../models/SchemeApplication.js';
import Subscription from '../models/Subscription.js';
import AdminWallet from '../models/AdminWallet.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const [
            totalFarmers,
            totalBuyers,
            activeListings,
            completedOrders,
            totalOrders,
            adminUser,
            pendingApprovals,
            activeSubscriptions,
            todayTransactions
        ] = await Promise.all([
            User.countDocuments({ role: 'farmer' }),
            User.countDocuments({ role: 'buyer' }),
            Crop.countDocuments({ status: { $in: ['active', 'available'] } }),
            Order.find({ status: 'completed' }),
            Order.countDocuments(),
            User.findOne({ role: 'admin' }),
            Crop.countDocuments({ status: 'pending_approval' }),
            Subscription.countDocuments({ status: 'active' }),
            Transaction.find({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } })
        ]);

        // Calculate total transaction volume (Orders)
        const orderRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate Subscription Revenue
        const allSubscriptions = await Subscription.find({ status: { $in: ['active', 'expired'] } });
        const subscriptionRevenue = allSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

        // Total Revenue (Order Commission + Subscriptions)
        // Assuming platform keeps 5% of order value + 100% of subscriptions?
        // Or just display Total Gross Revenue? Request says "Total Revenue (orders + subscriptions)"
        // Typically this means Platform Income, but for a summary it might mean GMV.
        // Let's return both or assume Gross Revenue for the platform.
        // If "Total Revenue" usually means what the business made:
        // Let's assume Order Commission is 5% as per earlier code snippet hint.
        // But user asked for "Total Revenue (orders + subscriptions)". 
        // Let's provide total Order Volume and Total Subscription Volume separately and combined.

        const totalRevenue = orderRevenue + subscriptionRevenue; // GMV

        // Get Actual Admin Wallet Balance (Platform Liquid Cash)
        let walletBalance = 0;
        if (adminUser) {
            const adminWallet = await Wallet.findOne({ userId: adminUser._id });
            if (adminWallet) {
                walletBalance = adminWallet.balance;
            }
        }

        res.json({
            success: true,
            data: {
                totalFarmers,
                totalBuyers,
                activeListings, // Total Crops
                totalOrders,
                totalRevenue, // Orders + Subscriptions GMV
                orderRevenue,
                subscriptionRevenue,
                walletBalance, // Actual money in admin wallet
                pendingApprovals,
                activeSubscriptions,
                todayTransactions: todayTransactions.length,
                todayTransactionValue: todayTransactions.reduce((sum, t) => sum + t.amount, 0)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/recent-users
router.get('/recent-users', async (req, res) => {
    try {
        const users = await User.find()
            .select('name role email address isVerified createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

import AdminMessage from '../models/AdminMessage.js';
import Notification from '../models/Notification.js';

// ... (previous imports)

// GET /api/admin/messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await AdminMessage.find().sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/messages
router.post('/messages', async (req, res) => {
    try {
        const { title, description, type, targetRole } = req.body;
        const message = new AdminMessage({
            title,
            description,
            type,
            targetRole: targetRole || 'farmer',
            createdBy: req.user._id
        });
        await message.save();

        // Trigger Notifications for all target users
        // This process handles async to avoid blocking response significantly, or use a queue in production.
        // For this scale, we'll do it inline but non-blocking (fire and forget or await if critical).
        const query = {};
        if (targetRole !== 'all') {
            query.role = targetRole;
        }

        // Find users to notify
        const users = await User.find(query).select('_id');

        if (users.length > 0) {
            const notifications = users.map(user => ({
                userId: user._id,
                title: title, // Announcement Title
                message: description, // Announcement Description
                type: 'admin',
                isRead: false
            }));

            await Notification.insertMany(notifications);
        }
        res.status(201).json({ success: true, message: 'Announcement posted', data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
    try {
        await AdminMessage.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/schemes
router.get('/schemes', async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 }).lean();

        // Get application counts for each scheme
        const schemesWithCounts = await Promise.all(schemes.map(async (scheme) => {
            const applicantsCount = await SchemeApplication.countDocuments({ schemeId: scheme._id });
            return {
                ...scheme,
                name: scheme.title, // Alias for frontend compatibility
                id: scheme._id,
                totalApplicants: applicantsCount
            };
        }));

        res.json({
            success: true,
            data: schemesWithCounts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/schemes
router.post('/schemes', async (req, res) => {
    try {
        const { title, description, eligibility, subsidyAmount, lastDate } = req.body;
        const scheme = new Scheme({
            title,
            description,
            eligibility,
            subsidyAmount,
            lastDate,
            isActive: true
        });
        await scheme.save();
        res.status(201).json({ success: true, message: 'Scheme created successfully', data: scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/schemes/:id
router.put('/schemes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const scheme = await Scheme.findByIdAndUpdate(id, updates, { new: true });

        if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found' });
        }

        res.json({ success: true, message: 'Scheme updated successfully', data: scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/schemes/:id
router.delete('/schemes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const scheme = await Scheme.findByIdAndDelete(id);

        if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found' });
        }

        // Optional: Delete associated applications? Or keep for record?
        // Let's keep them or delete? Better to keep or delete. 
        // For now, let's leave applications as orphaned or delete them.
        await SchemeApplication.deleteMany({ schemeId: id });

        res.json({ success: true, message: 'Scheme deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/schemes/:id/applications
router.get('/schemes/:id/applications', async (req, res) => {
    try {
        const { id } = req.params;
        const applications = await SchemeApplication.find({ schemeId: id })
            .populate('farmerId', 'name email address phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const application = await SchemeApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, message: `Application ${status}`, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
    try {
        const { type, status, startDate, endDate } = req.query;
        const query = {};

        if (type && type !== 'all') query.type = type;
        if (status && status !== 'all') query.status = status;

        if (startDate || endDate) {
            query.createdAt = {}; // Transaction uses timestamps, so createdAt
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Fetch transactions and populate Wallet -> User
        // Need to populate both userId and farmerId in case one is used over the other
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: 'walletId',
                select: 'userId farmerId',
                populate: [
                    { path: 'userId', select: 'name role email' },
                    { path: 'farmerId', select: 'name role email' }
                ]
            })
            .lean();

        const enrichedTransactions = await Promise.all(transactions.map(async (tx) => {
            // Resolve User from Wallet
            const wallet = tx.walletId;
            const user = wallet?.userId || wallet?.farmerId;

            let details = {
                productName: null,
                farmerName: null
            };

            // Try to find if reference is an Order ID or contains useful info
            // If reference is a generic string like "Order Payment", we might not find specific crop unless we search Orders by some other means like date/amount/user, which is fuzzy.
            // However, for this demo, if the reference string *contains* an ID or matched format, we could look it up.
            // Currently, backend sets reference as string description.
            // Let's at least return what we have.

            // If the transaction reference happens to be exactly an OrderID (unlikely with current farmer.js logic which sets it to description), we check.
            // But valid ObjectIds are 24 hex chars.
            if (tx.reference && mongoose.Types.ObjectId.isValid(tx.reference)) {
                // It might be an Order ID if logic was different, but mostly it's description.
                // We'll leave details empty for now unless we can link it better.
            }

            return {
                _id: tx._id,
                transactionId: tx._id,
                type: tx.type,
                status: tx.status,
                amount: tx.amount,
                date: tx.createdAt,
                description: tx.reference,
                userName: user?.name || 'Unknown User',
                userRole: user?.role || 'user',
                userEmail: user?.email,
                ...details
            };
        }));

        res.json({
            success: true,
            data: enrichedTransactions
        });
    } catch (error) {
        console.error("Transaction fetch error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        // 1. Daily Orders & Revenue (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Top Selling Crops (by Quantity)
        const topCrops = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: "$cropId",
                    totalSold: { $sum: "$quantity" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "crops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "crop"
                }
            },
            { $unwind: "$crop" },
            {
                $project: {
                    name: "$crop.name",
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        // 3. Top Farmers (by Revenue)
        const topFarmers = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: "$farmerId",
                    totalRevenue: { $sum: "$totalAmount" },
                    ordersCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "farmer"
                }
            },
            { $unwind: "$farmer" },
            {
                $project: {
                    name: "$farmer.name",
                    totalRevenue: 1,
                    ordersCount: 1
                }
            }
        ]);

        // 4. Buyer Activity/Status Distribution
        const orderStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                dailyStats,
                topCrops,
                topFarmers,
                orderStatus
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/crops
router.get('/crops', async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const crops = await Crop.find(query)
            .populate('farmerId', 'name email phone address')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: crops });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/crops/:id/status
router.put('/crops/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' (approved), 'rejected'

        const crop = await Crop.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }

        res.json({ success: true, message: `Crop status updated to ${status}`, data: crop });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/crops/:id
router.delete('/crops/:id', async (req, res) => {
    try {
        const crop = await Crop.findByIdAndDelete(req.params.id);
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        res.json({ success: true, message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// GET /api/admin/reports
router.get('/reports', async (req, res) => {
    try {
        const { type, status, startDate, endDate, location } = req.query;
        let data = [];

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        switch (type) {
            case 'farmers':
            case 'buyers': // Shared logic for users
                const userQuery = { role: type === 'farmers' ? 'farmer' : 'buyer', ...dateFilter };
                if (status && status !== 'all') {
                    if (status === 'verified') userQuery.isVerified = true;
                    if (status === 'pending') userQuery.isVerified = false;
                }
                if (location) userQuery.address = { $regex: location, $options: 'i' }; // Simple regex for location

                const users = await User.find(userQuery).select('-password').lean();
                data = users.map(u => ({
                    Name: u.name,
                    Email: u.email,
                    Phone: u.phone || 'N/A',
                    Address: u.address || 'N/A',
                    Joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A',
                    Status: u.isVerified ? 'Verified' : 'Pending'
                }));
                break;

            case 'orders':
                const orderQuery = { ...dateFilter };
                if (status && status !== 'all') orderQuery.status = status;

                const orders = await Order.find(orderQuery)
                    .populate('farmerId', 'name')
                    .populate('buyerId', 'name')
                    .populate('cropId', 'name') // Assuming we populate crop to get name
                    .lean();

                data = orders.map(o => ({
                    OrderId: o._id,
                    Crop: o.cropId?.name || 'Deleted Crop',
                    Farmer: o.farmerId?.name || 'Unknown',
                    Buyer: o.buyerId?.name || 'Unknown',
                    Quantity: o.quantity,
                    Amount: o.totalAmount,
                    Status: o.status,
                    Date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'
                }));
                break;

            case 'transactions':
                const txQuery = { ...dateFilter };
                if (status && status !== 'all') txQuery.status = status;

                const transactions = await Transaction.find(txQuery).lean();
                data = transactions.map(t => ({
                    TxId: t._id,
                    Type: t.type,
                    Amount: t.amount,
                    Status: t.status,
                    Date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : 'N/A',
                    Reference: t.reference || 'N/A'
                }));
                break;

            case 'schemes': // Report on Scheme Applications
                // If filtering by Scheme Status (approved/rejected)
                const appQuery = { ...dateFilter };
                if (status && status !== 'all') appQuery.status = status;

                const applications = await SchemeApplication.find(appQuery)
                    .populate('farmerId', 'name email')
                    .populate('schemeId', 'title')
                    .lean();

                data = applications.map(a => ({
                    ApplicationId: a._id,
                    Scheme: a.schemeId?.title || 'Unknown Scheme',
                    Farmer: a.farmerId?.name || 'Unknown',
                    FarmerEmail: a.farmerId?.email || 'N/A',
                    Status: a.status,
                    AppliedDate: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : 'N/A'
                }));
                break;

            case 'subscriptions':
                const subQuery = { ...dateFilter };
                if (status && status !== 'all') subQuery.status = status;

                const subscriptions = await Subscription.find(subQuery)
                    .populate('buyerId', 'name email phone')
                    .lean();

                data = subscriptions.map(s => ({
                    SubscriptionID: s._id,
                    Buyer: s.buyerId?.name || 'Unknown',
                    Email: s.buyerId?.email || 'N/A',
                    Phone: s.buyerId?.phone || 'N/A',
                    Plan: s.plan,
                    Amount: s.amount,
                    Status: s.status,
                    PaymentMethod: s.paymentMethod,
                    TransactionID: s.transactionId,
                    StartDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : 'N/A',
                    EndDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : 'N/A',
                    PurchasedDate: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A'
                }));
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid report type' });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error("Report Generation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// GET /api/admin/wallet
router.get('/wallet', async (req, res) => {
    try {
        let adminWallet = await AdminWallet.findOne();

        // Recalculate to ensure accuracy (Sync with DB)
        // 1. Calculate Subscription Income
        const subscriptions = await Subscription.find({
            status: { $in: ['active', 'expired'] }
        });
        const totalSubscriptionIncome = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

        // 2. Calculate Commission Income (5% of Completed Orders)
        const completedOrders = await Order.find({ status: 'completed' });
        const totalCommissionIncome = completedOrders.reduce((sum, order) => {
            return sum + ((order.totalAmount || 0) * 0.05);
        }, 0);

        const totalBalance = totalSubscriptionIncome + totalCommissionIncome;

        if (!adminWallet) {
            adminWallet = new AdminWallet();
        }

        // Update Wallet
        adminWallet.totalSubscriptionIncome = totalSubscriptionIncome;
        adminWallet.totalCommissionIncome = totalCommissionIncome;
        adminWallet.totalBalance = totalBalance;
        adminWallet.lastUpdated = Date.now();

        await adminWallet.save();

        res.json({ success: true, data: adminWallet });
    } catch (error) {
        console.error("Wallet Fetch Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/wallet/update (Internal/Manual trigger)
router.post('/wallet/update', async (req, res) => {
    try {
        const { amount, type } = req.body; // type: 'subscription', 'commission'

        // This endpoint should ideally be internal or strictly controlled.
        // Assuming this is manually called or called by payment webhook handler within system

        let adminWallet = await AdminWallet.findOne();
        if (!adminWallet) {
            adminWallet = new AdminWallet();
        }

        if (type === 'subscription') {
            adminWallet.totalSubscriptionIncome += Number(amount);
            adminWallet.totalBalance += Number(amount);
        } else if (type === 'commission') {
            adminWallet.totalCommissionIncome += Number(amount);
            adminWallet.totalBalance += Number(amount);
        }

        adminWallet.lastUpdated = Date.now();
        await adminWallet.save();

        res.json({ success: true, message: 'Admin wallet updated', data: adminWallet });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

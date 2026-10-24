import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get public statistics
router.get('/stats', async (req, res) => {
    try {
        const activeFarmers = await User.countDocuments({ role: 'farmer' });
        const verifiedBuyers = await User.countDocuments({ role: 'buyer' });
        // Assuming transactions count is number of orders
        const transactionsCount = await Order.countDocuments();
        // Assuming villages are stored in user profiles
        const villages = await User.distinct('village');
        const villagesCovered = villages.filter(v => v).length;

        // Calculate total transaction volume roughly (optional, but good for "₹50Cr+")
        // For now, let's just return counts to match the UI labels
        // The UI has "₹50Cr+" for transactions, which is value. 
        // Let's sum order amounts.
        const transactionVolumeResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const transactionVolume = transactionVolumeResult[0]?.total || 0;

        res.json({
            activeFarmers,
            verifiedBuyers,
            transactionsCount,
            villagesCovered,
            transactionVolume
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

export default router;
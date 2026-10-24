import express from 'express';
import { authMiddleware, buyerMiddleware } from '../middleware/auth.js';
import { checkBuyerSubscription } from '../middleware/subscription.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import Payment from '../models/Payment.js';
import Wallet from '../models/Wallet.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.use(authMiddleware);
router.use(buyerMiddleware);

// GET Subscription Status
router.get('/status', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.isSubscribed) {
            return res.json({ success: true, data: { isSubscribed: false } });
        }

        // Fetch active subscription details for receipt
        const subscription = await Subscription.findOne({
            userId: req.user._id,
            role: 'buyer',
            status: { $in: ['active'] }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                isSubscribed: true,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionEnd: user.subscriptionEnd,
                transactionId: subscription ? subscription.transactionId : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Plans
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 'pro',
                name: 'Pro Plan',
                price: 499,
                duration: '1 month',
                features: [
                    'Unlimited Crop Orders',
                    'Wallet Payments Enabled',
                    'View Farmer Crop Listings',
                    'Order History',
                    'Basic Analytics',
                    'Email Support'
                ]
            },
            {
                id: 'premium',
                name: 'Premium Plan',
                price: 999,
                duration: '1 year',
                features: [
                    'All Pro Plan Features',
                    'Priority Farmer Access',
                    'Direct Farmer Contact Details',
                    'Zero Platform Commission',
                    'Bulk Order Support',
                    'Advanced Order Analytics',
                    'Priority Customer Support (24/7)',
                    'Early Access to New Crops'
                ]
            }
        ]
    });
});

// Subscribe (Direct Pay)
router.post('/subscribe', async (req, res) => {
    try {
        const { planId, paymentMethod } = req.body; // paymentMethod: 'PhonePe', 'GPay', 'Paytm', 'wallet'
        const PLANS = {
            'pro': { price: 499, durationMonths: 1, name: 'Pro Plan' },
            'premium': { price: 999, durationMonths: 12, name: 'Premium Plan' }
        };

        const plan = PLANS[planId];
        if (!plan) return res.status(400).json({ message: 'Invalid plan' });

        const validMethods = ['wallet', 'PhonePe', 'GPay', 'Paytm'];
        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Create Payment Record (Pending)
        const payment = new Payment({
            buyerId: req.user._id,
            subscriptionPlan: planId,
            amount: plan.price,
            paymentMethod: paymentMethod,
            status: 'pending'
        });
        await payment.save();

        const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Handle Buyer Wallet Deduction (if applicable)
        if (paymentMethod === 'wallet') {
            const buyerWallet = await Wallet.findOne({ userId: req.user._id });
            if (!buyerWallet || buyerWallet.balance < plan.price) {
                payment.status = 'failed';
                await payment.save();
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
            buyerWallet.balance -= plan.price;
            await buyerWallet.save();

            // Record Debit Transaction for Buyer
            await Transaction.create({
                walletId: buyerWallet._id,
                type: 'debit',
                amount: plan.price,
                reference: `Subscription Purchase: ${plan.name}`,
                status: 'completed'
            });
        }

        // Credit Admin Wallet (Revenue) - Simulating platform receiving money
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            let adminWallet = await Wallet.findOne({ userId: adminUser._id });
            if (!adminWallet) {
                adminWallet = new Wallet({ userId: adminUser._id, balance: 0 });
            }
            adminWallet.balance += plan.price;
            await adminWallet.save();

            // Record Credit Transaction for Admin
            await Transaction.create({
                walletId: adminWallet._id,
                type: 'credit',
                amount: plan.price,
                reference: `Subscription Revenue: ${plan.name} (${req.user.name})`,
                status: 'completed'
            });
        }


        // Create Subscription Record
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        const subscription = new Subscription({
            userId: req.user._id,
            role: 'buyer',
            plan: planId,
            amount: plan.price,
            status: 'active',
            paymentMethod,
            transactionId: txnId,
            startDate,
            endDate
        });

        await subscription.save();

        // Update User
        await User.findByIdAndUpdate(req.user._id, {
            isSubscribed: true,
            subscriptionPlan: planId,
            subscriptionStart: startDate,
            subscriptionEnd: endDate
        });

        // Update Payment Status to Completed
        payment.status = 'completed';
        await payment.save();

        res.json({ success: true, message: 'Subscription activated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Subscription failed' });
    }
});



// GET /details/:transactionId - Get Subscription Details for Web Invoice
router.get('/details/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const subscription = await Subscription.findOne({
            transactionId: transactionId,
            userId: req.user._id,
            role: 'buyer'
        }).populate('userId', 'name email phone mobile');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        // We also need plan details which are not in the db model directly (just the ID 'pro'/'premium')
        // So we append that info
        const PLANS = {
            'pro': { price: 499, duration: '1 month', name: 'Pro Plan' },
            'premium': { price: 999, duration: '1 year', name: 'Premium Plan' }
        };
        const planDetails = PLANS[subscription.plan] || { name: subscription.plan, duration: 'Unknown' };

        res.json({
            success: true,
            data: {
                ...subscription.toObject(),
                planDetails
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /receipt/:transactionId - Download Receipt
router.get('/receipt/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Fetch real data
        const subscription = await Subscription.findOne({
            transactionId: transactionId,
            userId: req.user._id,
            role: 'buyer'
        }).populate('userId', 'name email phone');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }

        const buyer = subscription.userId;

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set Headers for Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${transactionId}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('AgriTrade Direct', { align: 'center' }).moveDown(0.5);
        doc.fontSize(12).text('Payment Receipt', { align: 'center' }).moveDown(2);

        // Receipt Details
        doc.fontSize(10).text(`Receipt No: ${transactionId}`, { align: 'right' });
        doc.text(`Date: ${new Date(subscription.createdAt).toLocaleString()}`, { align: 'right' }).moveDown(2);

        // Buyer Details
        doc.text('Billed To:', { underline: true }).moveDown(0.5);
        doc.text(`Name: ${buyer.name}`);
        doc.text(`Email: ${buyer.email}`);
        doc.text(`Phone: ${buyer.phone || 'N/A'}`).moveDown(2);

        // Payment Details Box
        const startX = 50;
        const startY = doc.y;
        const col1 = 50;
        const col2 = 300;

        doc.rect(startX, startY, 500, 30).fill('#f0f0f0').stroke();
        doc.fillColor('black').text('Description', col1 + 10, startY + 10);
        doc.text('Amount', col2, startY + 10, { align: 'right', width: 200 });

        const rowY = startY + 40;
        doc.text(`Subscription Plan: ${subscription.plan.toUpperCase()} Plan`, col1 + 10, rowY);
        doc.text(`₹${subscription.amount.toLocaleString()}`, col2, rowY, { align: 'right', width: 200 });

        doc.moveTo(startX, rowY + 20).lineTo(startX + 500, rowY + 20).stroke();

        // Total
        const totalY = rowY + 30;
        doc.fontSize(12).text('Total Paid:', col1 + 10, totalY);
        doc.text(`₹${subscription.amount.toLocaleString()}`, col2, totalY, { align: 'right', width: 200 });

        // Footer
        doc.moveDown(5);
        doc.fontSize(10).text('Thank you for choosing AgriTrade Direct!', { align: 'center' });
        doc.text('This is a computer-generated receipt.', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Receipt Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate receipt' });
    }
});

export default router;

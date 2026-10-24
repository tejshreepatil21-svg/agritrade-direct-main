import express from 'express';
import { authMiddleware, farmerMiddleware, adminMiddleware } from '../middleware/auth.js';
import SubsidyChat from '../models/SubsidyChat.js';
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// FARMER ROUTES
// ==========================================

// Get or Create Chat for Farmer
router.get('/farmer/chat', authMiddleware, farmerMiddleware, async (req, res) => {
    try {
        let chat = await SubsidyChat.findOne({ farmerId: req.user._id });

        if (!chat) {
            // Create new chat
            chat = new SubsidyChat({
                farmerId: req.user._id,
                farmerName: req.user.name,
                messages: []
            });
            await chat.save();
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Get farmer chat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send Message from Farmer
router.post('/farmer/send', authMiddleware, farmerMiddleware, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        let chat = await SubsidyChat.findOne({ farmerId: req.user._id });

        if (!chat) {
            chat = new SubsidyChat({
                farmerId: req.user._id,
                farmerName: req.user.name,
                messages: []
            });
        }

        chat.messages.push({
            sender: 'farmer',
            text: message.trim(),
            time: new Date()
        });

        chat.lastMessageAt = new Date();
        chat.status = 'open';

        await chat.save();

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Send farmer message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get All Chats (Admin)
router.get('/admin/chats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const chats = await SubsidyChat.find()
            .populate('farmerId', 'name email phone')
            .sort({ lastMessageAt: -1 });

        res.json({ success: true, data: chats });
    } catch (error) {
        console.error('Get admin chats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Single Chat (Admin)
router.get('/admin/chat/:farmerId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { farmerId } = req.params;

        const chat = await SubsidyChat.findOne({ farmerId })
            .populate('farmerId', 'name email phone');

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Get admin single chat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send Message from Admin
router.post('/admin/send', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { farmerId, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        if (!farmerId) {
            return res.status(400).json({ success: false, message: 'Farmer ID is required' });
        }

        const chat = await SubsidyChat.findOne({ farmerId });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        chat.messages.push({
            sender: 'admin',
            text: message.trim(),
            time: new Date()
        });

        chat.lastMessageAt = new Date();

        await chat.save();

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Send admin message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Chat Status (Admin)
router.patch('/admin/status/:farmerId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { status } = req.body;

        if (!['open', 'closed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const chat = await SubsidyChat.findOneAndUpdate(
            { farmerId },
            { status },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Update chat status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

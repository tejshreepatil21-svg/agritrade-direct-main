import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import SchemeApplication from '../models/SchemeApplication.js';
import Scheme from '../models/Scheme.js';

const router = express.Router();

// Get all available schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user subscriptions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await SchemeApplication.find({ farmerId: req.user._id }).populate('schemeId');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply for a scheme
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { schemeId } = req.body;

    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme || !scheme.isActive) {
      return res.status(400).json({ message: 'Scheme not found or inactive' });
    }

    // Check if already applied
    const existing = await SchemeApplication.findOne({
      farmerId: req.user._id,
      schemeId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already applied for this scheme' });
    }

    const subscription = new SchemeApplication({
      farmerId: req.user._id,
      schemeId,
      status: 'applied',
    });

    await subscription.save();

    res.status(201).json({ message: 'Application submitted successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

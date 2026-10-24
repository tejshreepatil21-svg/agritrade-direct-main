import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import BankDetails from '../models/BankDetails.js';

const router = express.Router();

// Get bank details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({ userId: req.user._id });
    res.json(bankDetails || { message: 'No bank details found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/Update bank details
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { accountNumber, ifscCode, bankName, accountHolderName } = req.body;

    let bankDetails = await BankDetails.findOne({ userId: req.user._id });

    if (bankDetails) {
      bankDetails.accountNumber = accountNumber;
      bankDetails.ifscCode = ifscCode;
      bankDetails.bankName = bankName;
      bankDetails.accountHolderName = accountHolderName;
      await bankDetails.save();
    } else {
      bankDetails = new BankDetails({
        userId: req.user._id,
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
      });
      await bankDetails.save();
    }

    res.json({ message: 'Bank details saved successfully', bankDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import BankAccount from '../models/BankAccount.js';
import Notification from '../models/Notification.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js'; // Added import for validation
import crypto from 'crypto';

const router = express.Router();

// ... (Encryption settings and helpers remain same)
// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text, iv) {
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Get wallet status
// ...

// Add money to wallet
router.post('/add-money', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = new Wallet({
        userId: req.user._id,
        balance: 0,
      });
    }

    const addAmount = Number(amount);
    wallet.balance += addAmount;
    await wallet.save();

    // Create Transaction Record
    const transaction = new Transaction({
      walletId: wallet._id,
      type: 'credit',
      amount: addAmount,
      reference: `Added Money via ${paymentMethod || 'Online'}`,
      status: 'completed'
    });
    await transaction.save();

    // Notify User
    const notification = new Notification({
      userId: req.user._id,
      title: 'Money Added',
      message: `₹${addAmount} has been added to your wallet via ${paymentMethod || 'Online'}.`,
      type: 'payment',
    });
    await notification.save();

    res.json({ message: 'Money added successfully', wallet });
  } catch (error) {
    console.error("Add Money Error:", error);
    res.status(500).json({ message: error.message || "Failed to add money" });
  }
});

// Withdraw money (Generic)
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const withdrawAmount = Number(amount);

    let wallet = await Wallet.findOne({ userId: req.user._id });

    // Farmer support
    if (!wallet && req.user.role === 'farmer') {
      wallet = await Wallet.findOne({ farmerId: req.user._id });
    }

    if (!wallet || wallet.balance < withdrawAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= withdrawAmount;
    await wallet.save();

    try {
      // Create Transaction
      const transaction = new Transaction({
        walletId: wallet._id,
        type: 'debit',
        amount: withdrawAmount,
        reference: 'Withdrawal to Bank',
        status: 'pending' // As withdrawals usually need processing
      });
      await transaction.save();
    } catch (txError) {
      console.error("Withdraw transaction log error:", txError);
    }

    res.json({ message: 'Withdrawal initiated', wallet });
  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// Get wallet status
router.get('/', authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    // Also try finding by farmerId if this is a farmer wallet access
    if (!wallet && req.user.role === 'farmer') {
      wallet = await Wallet.findOne({ farmerId: req.user._id });
    }

    if (!wallet) {
      const walletData = {
        balance: 0,
      };
      // Handle schema difference
      if (req.user.role === 'farmer') {
        walletData.farmerId = req.user._id;
      } else {
        walletData.userId = req.user._id;
      }
      wallet = new Wallet(walletData);
      await wallet.save();
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// ========================
// BANK ACCOUNT ROUTES
// ========================

// Add Bank Account
router.post('/add-bank', authMiddleware, async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, accountType } = req.body;

    // Validation
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !accountType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^[0-9]+$/.test(accountNumber)) {
      return res.status(400).json({ message: 'Account number must contain only digits' });
    }

    const existingBank = await BankAccount.findOne({ userId: req.user._id });
    if (existingBank) {
      return res.status(400).json({ message: 'Bank account already exists' });
    }

    // Encrypt Account Number
    const { iv, encryptedData } = encrypt(accountNumber);

    const newBank = new BankAccount({
      userId: req.user._id,
      role: req.user.role,
      accountHolderName,
      bankName,
      accountNumber: encryptedData,
      iv,
      ifscCode,
      accountType
    });

    await newBank.save();

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: {
        ...newBank._doc,
        accountNumber: `****${accountNumber.slice(-4)}` // Masked
      }
    });

  } catch (error) {
    console.error("Add bank error", error);
    res.status(500).json({ message: 'Failed to add bank account' });
  }
});

// Get Bank Details
router.get('/bank-details', authMiddleware, async (req, res) => {
  try {
    let bank = await BankAccount.findOne({ userId: req.user._id });

    // Fallback: Check if bank details exist in User profile (legacy/settings sync)
    if (!bank) {
      const user = await User.findById(req.user._id).select('+bankAccount');

      // If user has bank details in their profile, migrate them to BankAccount model
      if (user && user.bankAccount && user.ifsc && user.bankName && user.accountHolderName) {
        // Encrypt Account Number from User profile
        const { iv, encryptedData } = encrypt(user.bankAccount); // Assuming encrypt function is available in scope

        bank = new BankAccount({
          userId: req.user._id,
          role: req.user.role || 'farmer', // Default to farmer if role missing, or current user role
          accountHolderName: user.accountHolderName,
          bankName: user.bankName,
          accountNumber: encryptedData,
          iv: iv,
          ifscCode: user.ifsc,
          accountType: 'savings' // Default as not captured in profile
        });

        await bank.save();
      }
    }

    if (!bank) {
      return res.status(404).json({ success: false, message: 'No bank account link' });
    }

    // Decrypt for verify actions only, but for display we send masked
    // Here we just send masked
    const decryptedNum = decrypt(bank.accountNumber, bank.iv);

    res.json({
      success: true,
      data: {
        ...bank._doc,
        accountNumber: `****${decryptedNum.slice(-4)}`
      }
    });

  } catch (error) {
    console.error("Fetch bank details error:", error);
    res.status(500).json({ message: 'Failed to fetch bank details' });
  }
});

// Delete Bank Account
router.delete('/delete-bank', authMiddleware, async (req, res) => {
  try {
    const deletedBank = await BankAccount.findOneAndDelete({ userId: req.user._id });

    if (!deletedBank) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    res.json({ success: true, message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error("Delete bank error", error);
    res.status(500).json({ message: 'Failed to delete bank account' });
  }
});

// Pay Farmer (Buyer to Farmer)
router.post('/pay-farmer', authMiddleware, async (req, res) => {
  try {
    const { farmerId, amount, cropId, orderId } = req.body;

    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can make payments to farmers' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    // 1. Validate Order & Details
    let cropName = 'Unknown Crop';
    let quantity = 0;
    let unit = 'Kg';
    let buyerId = req.user._id;

    if (orderId) {
      const order = await Order.findById(orderId).populate('cropId');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Strict Validation
      if (order.buyerId.toString() !== buyerId.toString()) return res.status(403).json({ message: 'Unauthorized order payment' });
      if (order.farmerId.toString() !== farmerId.toString()) return res.status(400).json({ message: 'Farmer ID mismatch' });
      if (Number(amount) !== Number(order.totalAmount)) return res.status(400).json({ message: 'Amount mismatch with Order total' });

      // Check for duplicate payment? (Optional: check if already paid)
      // if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Order already paid' });

      cropName = order.cropId?.name || 'Crop';
      quantity = order.quantity;
      unit = order.cropId?.unit || 'Kg';
    }

    // 2. Fetch Wallets
    const buyerWallet = await Wallet.findOne({ userId: buyerId });
    if (!buyerWallet || buyerWallet.balance < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    let farmerWallet = await Wallet.findOne({ farmerId: farmerId });
    if (!farmerWallet) {
      // Fallback or create logic
      farmerWallet = await Wallet.findOne({ userId: farmerId });
      if (!farmerWallet) {
        farmerWallet = new Wallet({ farmerId, userId: farmerId, balance: 0 });
      }
    }

    // 3. EXECUTE TRANSACTION (Simulated Atomicity)
    // Decrement Buyer
    buyerWallet.balance -= Number(amount);
    await buyerWallet.save();

    try {
      // Increment Farmer
      farmerWallet.balance += Number(amount);
      await farmerWallet.save();
    } catch (err) {
      // CRITICAL: Rollback Buyer logic if Farmer save fails
      console.error("Farmer wallet save failed. Rolling back buyer deduction...");
      buyerWallet.balance += Number(amount);
      await buyerWallet.save();
      throw new Error("Transaction failed. Amount refunded.");
    }

    // 4. Create Detailed Transaction Records
    const txDetails = {
      amount: Number(amount),
      status: 'success', // or 'completed' matching schema enum default
      transactionType: 'crop_payment',
      buyerId: buyerId,
      farmerId: farmerId,
      cropName: cropName,
      quantity: quantity,
      unit: unit,
    };

    // Buyer Record (Debit)
    const buyerTx = new Transaction({
      ...txDetails,
      walletId: buyerWallet._id,
      type: 'debit',
      reference: `Paid for ${cropName} (Order #${orderId})`,
      status: 'completed'
    });
    await buyerTx.save();

    // Farmer Record (Credit)
    const farmerTx = new Transaction({
      ...txDetails,
      walletId: farmerWallet._id,
      type: 'credit',
      reference: `Received for ${cropName} (Order #${orderId})`,
      status: 'completed'
    });
    await farmerTx.save();

    // 5. Update Order Status (if applicable)
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
    }

    // 6. Notify Farmer
    await Notification.create({
      userId: farmerId,
      title: 'Payment Received',
      message: `Received ₹${amount} from ${req.user.name} for ${quantity} ${unit} of ${cropName}.`,
      type: 'payment',
    });

    res.json({
      success: true,
      message: 'Payment Reference: ' + buyerTx._id,
      balance: buyerWallet.balance
    });

  } catch (error) {
    console.error("Pay Farmer Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get Wallet Transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.json({ transactions: [] });

    // Use Transaction model
    const transactions = await Transaction.find({ walletId: wallet._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

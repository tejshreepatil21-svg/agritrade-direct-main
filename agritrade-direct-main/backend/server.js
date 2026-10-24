// Backend Server - Restart Triggered
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import subscriptionRoutes from './routes/schemeApplications.js';
import walletRoutes from './routes/wallet.js';
import bankRoutes from './routes/bank.js';
import orderRoutes from './routes/orders.js';
import farmerRoutes from './routes/farmer.js';
import buyerRoutes from './routes/buyer.js';
import buyerSubscriptionRoutes from './routes/buyerSubscription.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import subsidyChatRoutes from './routes/subsidyChat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bank', bankRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/buyer/subscription', buyerSubscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/subsidy-chat', subsidyChatRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgriTrade API is running' });
});

// Connect to MongoDB
// Connect to MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB URI:', err.message);
    try {
      console.log('Attempting to connect to local MongoDB (127.0.0.1:27017)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/agritrade');
      console.log('Connected to local MongoDB');
    } catch (localErr) {
      console.error('Local MongoDB connection failed:', localErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;

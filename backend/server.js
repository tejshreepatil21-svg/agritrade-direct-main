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
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgriTrade API is running' });
});

// Connect to MongoDB with Fallback
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agritrade');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Primary DB connection failed: ${error.message}`);
    console.log('--------------------------------------------------');
    console.warn('⚠️  CRITICAL: Falling back to In-Memory Database!');
    console.warn('⚠️  WARNING: Data will NOT be saved to Atlas.');
    console.warn('⚠️  Check IP whitelisting in your MongoDB Atlas dashboard.');
    console.log('--------------------------------------------------');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`🚀 In-Memory MongoDB started at: ${uri}`);

      await mongoose.connect(uri);
      console.log('✅ Connected to In-Memory MongoDB');
      console.warn('!!! DATA WILL BE LOST WHEN SERVER STOPS !!!');
    } catch (innerError) {
      console.error('Fatal: Could not connect to any database.', innerError);
      process.exit(1);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;

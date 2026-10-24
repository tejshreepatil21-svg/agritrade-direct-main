import mongoose from 'mongoose';

const adminWalletSchema = new mongoose.Schema(
    {
        totalBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalSubscriptionIncome: {
            type: Number,
            default: 0,
        },
        totalCommissionIncome: {
            type: Number,
            default: 0,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const AdminWallet = mongoose.model('AdminWallet', adminWalletSchema);

export default AdminWallet;

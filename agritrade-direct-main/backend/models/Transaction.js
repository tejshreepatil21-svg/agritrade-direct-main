import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        reference: {
            type: String, // e.g., "Withdrawal to Bank" or Order ID
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        },
        // Extended fields for Crop Payments
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        cropName: String,
        quantity: Number,
        unit: String,
        transactionType: {
            type: String,
            default: 'general',
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

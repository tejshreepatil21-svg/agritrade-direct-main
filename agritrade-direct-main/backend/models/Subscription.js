import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['buyer', 'farmer'],
        required: true
    },
    plan: {
        type: String,
        enum: ['pro', 'premium'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

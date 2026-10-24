import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            unique: true
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        transactionId: {
            type: String,
            default: ''
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        items: [
            {
                name: String,
                description: String,
                quantity: Number,
                unitPrice: Number,
                total: Number,
            }
        ],
        billingDetails: {
            name: String,
            email: String,
            address: String,
            phone: String,
        },
        supplierDetails: {
            name: String,
            email: String,
            address: String,
            phone: String,
        }
    },
    {
        timestamps: true,
    }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;

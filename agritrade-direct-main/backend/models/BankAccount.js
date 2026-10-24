import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One bank account per user for now
        },
        role: {
            type: String, // farmer, buyer
            required: true,
        },
        accountHolderName: {
            type: String,
            required: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String, // Encrypted string
            required: true,
        },
        iv: {
            type: String, // Initialization vector for encryption
            required: true
        },
        ifscCode: {
            type: String,
            required: true,
        },
        accountType: {
            type: String,
            enum: ['savings', 'current'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;

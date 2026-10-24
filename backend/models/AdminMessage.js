import mongoose from 'mongoose';

const adminMessageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['announcement', 'alert', 'news', 'policy'], // Added policy/news as requested
            default: 'announcement'
        },
        targetRole: {
            type: String,
            enum: ['farmer', 'buyer', 'all'],
            default: 'farmer'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

const AdminMessage = mongoose.model('AdminMessage', adminMessageSchema);

export default AdminMessage;

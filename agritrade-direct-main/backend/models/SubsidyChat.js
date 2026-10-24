import mongoose from 'mongoose';

const subsidyChatSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    messages: [{
        sender: {
            type: String,
            enum: ['farmer', 'admin'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, { timestamps: true });

// Index for faster queries
subsidyChatSchema.index({ farmerId: 1 });
subsidyChatSchema.index({ lastMessageAt: -1 });

const SubsidyChat = mongoose.model('SubsidyChat', subsidyChatSchema);

export default SubsidyChat;

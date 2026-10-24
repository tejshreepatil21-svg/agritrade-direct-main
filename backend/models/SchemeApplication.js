import mongoose from 'mongoose';

const schemeApplicationSchema = new mongoose.Schema(
    {
        schemeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scheme',
            required: true,
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['applied', 'approved', 'rejected'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications
schemeApplicationSchema.index({ schemeId: 1, farmerId: 1 }, { unique: true });

const SchemeApplication = mongoose.model('SchemeApplication', schemeApplicationSchema);

export default SchemeApplication;

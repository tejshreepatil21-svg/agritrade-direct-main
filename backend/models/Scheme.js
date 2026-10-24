import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    lastDate: {
      type: Date,
      required: true,
    },
    subsidyAmount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;

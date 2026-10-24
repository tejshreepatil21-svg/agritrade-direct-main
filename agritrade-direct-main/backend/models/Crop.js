import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'liter', 'bag'],
      default: 'kg',
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: [
        'cereals',
        'pulses',
        'vegetables',
        'fruits',
        'spices',
        'oils',
        'dairy',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'out_of_stock', 'pending_approval', 'rejected'],
      default: 'active',
      index: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingQuantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Set remainingQuantity equal to quantity on creation
cropSchema.pre('save', function (next) {
  if (this.isNew) {
    this.remainingQuantity = this.quantity;
  }
  next();
});

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
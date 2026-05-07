import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    optionSummary: { type: String, default: '' },
    availabilityAction: { type: String, enum: ['remove', 'cancel', 'call'], default: 'remove' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    orderMode: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    },
    deliveryFee: { type: Number, default: 0 },
    etaText: { type: String, default: '10-15 min' },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'done', 'confirmed', 'on-the-way', 'delivered'],
      default: 'pending'
    },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    trackingCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);

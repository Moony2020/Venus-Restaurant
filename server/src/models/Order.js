import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    extras: [
      {
        label: { type: String },
        price: { type: Number },
        groupId: { type: String },
        optionId: { type: String }
      }
    ],
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
    paymentMethod: {
      type: String,
      enum: ['pay_on_pickup', 'stripe', 'paypal'],
      default: 'pay_on_pickup'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid'
    },
    stripeSessionId: { type: String, default: null },
    paypalOrderId: { type: String, default: null },
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

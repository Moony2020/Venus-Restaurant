import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    eventType: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1 },
    preferredDate: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'booked'],
      default: 'new'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    stripeSessionId: { type: String, default: '' }
  },
  { timestamps: true, collection: 'inquiries' }
);

export default mongoose.model('Inquiry', inquirySchema);

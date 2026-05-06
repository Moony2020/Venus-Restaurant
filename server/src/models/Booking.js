import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'cancelled'],
      default: 'new'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);


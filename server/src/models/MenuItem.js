import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['appetizer', 'main', 'dessert', 'drink'],
      required: true
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    lunchOfDay: { type: Boolean, default: false },
    prepMinutes: { type: Number, default: 15 }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    position: { type: Number, default: 0, index: true },
    available: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    lunchOfDay: { type: Boolean, default: false },
    prepMinutes: { type: Number, default: 15 }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);

import mongoose from 'mongoose';

const needItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['ok', 'need_soon', 'urgent'],
      default: 'ok'
    },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('NeedItem', needItemSchema);


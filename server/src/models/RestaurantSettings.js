import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    open: { type: String, default: '10:00' },
    close: { type: String, default: '23:00' },
    closed: { type: Boolean, default: false }
  },
  { _id: false }
);

const restaurantSettingsSchema = new mongoose.Schema(
  {
    week: {
      monday: { type: daySchema, default: () => ({}) },
      tuesday: { type: daySchema, default: () => ({}) },
      wednesday: { type: daySchema, default: () => ({}) },
      thursday: { type: daySchema, default: () => ({}) },
      friday: { type: daySchema, default: () => ({}) },
      saturday: { type: daySchema, default: () => ({}) },
      sunday: { type: daySchema, default: () => ({}) }
    },
    manualOverride: {
      type: String,
      enum: ['none', 'force_open', 'force_closed'],
      default: 'none'
    },
    manualMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('RestaurantSettings', restaurantSettingsSchema);


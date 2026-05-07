import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    open: { type: String, default: '11:00' },
    close: { type: String, default: '22:00' },
    closed: { type: Boolean, default: false }
  },
  { _id: false }
);

const restaurantSettingsSchema = new mongoose.Schema(
  {
    week: {
      monday: { type: daySchema, default: () => ({ open: '11:00', close: '22:00' }) },
      tuesday: { type: daySchema, default: () => ({ open: '11:00', close: '22:00' }) },
      wednesday: { type: daySchema, default: () => ({ open: '11:00', close: '22:00' }) },
      thursday: { type: daySchema, default: () => ({ open: '11:00', close: '22:00' }) },
      friday: { type: daySchema, default: () => ({ open: '11:00', close: '23:00' }) },
      saturday: { type: daySchema, default: () => ({ open: '12:00', close: '23:00' }) },
      sunday: { type: daySchema, default: () => ({ open: '12:00', close: '22:00' }) }
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

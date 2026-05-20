import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: 'c:/coding-projects/Venus/server/.env' });

const MONGO_URI = process.env.MONGO_URI;

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
      monday: { type: daySchema },
      tuesday: { type: daySchema },
      wednesday: { type: daySchema },
      thursday: { type: daySchema },
      friday: { type: daySchema },
      saturday: { type: daySchema },
      sunday: { type: daySchema }
    },
    manualOverride: {
      type: String,
      default: 'none'
    },
    manualMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

const RestaurantSettings = mongoose.model('RestaurantSettings', restaurantSettingsSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const settings = await RestaurantSettings.findOne();
  console.log('Settings:', JSON.stringify(settings, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);

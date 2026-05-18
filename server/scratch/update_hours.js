import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import RestaurantSettings from '../src/models/RestaurantSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await RestaurantSettings.findOneAndUpdate(
      {},
      { $set: { "week.friday.close": "24:00", "week.friday.closed": false } },
      { new: true }
    );
    console.log('Friday close is now:', result.week.friday.close);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import RestaurantSettings from '../src/models/RestaurantSettings.js';
import { getNowStatus } from '../src/controllers/restaurantController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const settings = await RestaurantSettings.findOne();
    const status = getNowStatus(settings);
    console.log("=== FULL SETTINGS ===");
    console.log(JSON.stringify(settings.week, null, 2));
    console.log("=== CALCULATED STATUS ===");
    console.log(JSON.stringify(status, null, 2));
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });

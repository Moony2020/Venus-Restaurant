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
    const settings = await RestaurantSettings.findOne();
    console.log('Current DB Status:');
    console.log('Manual Override:', settings?.manualOverride);
    console.log('Friday Hours:', settings?.week?.friday);
    console.log('Saturday Hours:', settings?.week?.saturday);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });

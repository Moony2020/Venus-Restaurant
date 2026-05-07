import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import RestaurantSettings from '../server/src/models/RestaurantSettings.js';

dotenv.config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)) });

async function updateHours() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing in server/.env');
    await mongoose.connect(process.env.MONGO_URI);
    
    const settings = await RestaurantSettings.findOne();
    if (!settings) {
      console.log('No settings found, creating with new defaults...');
      await RestaurantSettings.create({});
    } else {
      console.log('Updating existing settings...');
      settings.week = {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '12:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '22:00', closed: false }
      };
      await settings.save();
    }
    
    console.log('Opening hours updated successfully in the database.');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }
}

updateHours();

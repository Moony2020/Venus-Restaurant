import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import MenuItem from './models/MenuItem.js';
import { seedMenuIfEmpty } from './seed.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

async function reset() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Clearing menu items...');
    await MenuItem.deleteMany({});

    console.log('Re-seeding menu...');
    // Reuse canonical categories from seed.js (single source of truth).
    await seedMenuIfEmpty();

    console.log('Database reset and re-seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
}

reset();

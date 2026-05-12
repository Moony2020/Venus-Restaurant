/**
 * One-time script to migrate existing database categories to the new strict format.
 * Run: node --experimental-modules src/migrateCategories.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/venus';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const items = await MenuItem.find({});
  let updatedCount = 0;
  let errorCount = 0;

  console.log(`Checking ${items.length} items...`);

  for (const item of items) {
    const rawCategory = item.category;
    
    try {
      // item.save() will trigger the pre('validate') hook which calls normalizeCategory
      await item.save(); 
      
      if (item.category !== rawCategory) {
        console.log(`✅ Normalized: "${rawCategory}" -> "${item.category}" for item: ${item.name}`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ FAILED TO NORMALIZE: "${rawCategory}" for item: ${item.name}`);
      console.error(`   Reason: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n--- Migration Results ---');
  console.log(`Updated/Normalized: ${updatedCount}`);
  console.log(`Failed (needs manual fix): ${errorCount}`);
  console.log('-------------------------\n');

  await mongoose.disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});

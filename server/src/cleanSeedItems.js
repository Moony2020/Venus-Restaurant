/**
 * One-time script to remove old seed items from the database.
 * Run: node --experimental-modules src/cleanSeedItems.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/venus';

const slugsToRemove = [
  'miyazaki-wagyu',
  'tartufo-pizza',
  'cosmic-chocolate',
  'nightcap',
  'pommes-frites'
];

async function clean() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.db
    .collection('menuitems')
    .deleteMany({ slug: { $in: slugsToRemove } });

  console.log(`Deleted ${result.deletedCount} seed items`);
  await mongoose.disconnect();
  process.exit(0);
}

clean().catch((err) => {
  console.error(err);
  process.exit(1);
});

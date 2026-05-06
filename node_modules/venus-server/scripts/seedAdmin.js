import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@venus.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_SEED_NAME || 'Venus Admin';

async function seedAdmin() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI missing in server/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated existing user to admin: ${ADMIN_EMAIL}`);
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'admin'
  });

  console.log(`Admin created: ${ADMIN_EMAIL}`);
}

seedAdmin()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

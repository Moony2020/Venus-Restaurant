import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function rename() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('leads')) {
      console.log('Renaming "leads" collection to "inquiries"...');
      await db.collection('leads').rename('inquiries');
      console.log('Collection renamed successfully!');
    } else {
      console.log('"leads" collection not found or already renamed.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error renaming collection:', err.message);
    process.exit(1);
  }
}

rename();

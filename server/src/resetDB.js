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
    // We need to bypass the count check or just call insertMany directly.
    // Let's just modify seed.js temporarily or just do it here.
    const items = [
        {
          name: 'Miyazaki Wagyu',
          slug: 'miyazaki-wagyu',
          category: 'main',
          description: 'A5 Wagyu med tryffelsmör och rostade rödbetor.',
          image: '/images/hero-steak.png',
          price: 1250,
          lunchOfDay: true,
          prepMinutes: 25
        },
        {
          name: 'Tartufo Pizza',
          slug: 'tartufo-pizza',
          category: 'main',
          description: 'Black truffle, fior di latte, aged soy glaze, gold flakes.',
          image: '/images/menu-pizza.png',
          price: 650,
          prepMinutes: 18
        },
        {
          name: 'Cosmic Chocolate',
          slug: 'cosmic-chocolate',
          category: 'dessert',
          description: 'Salted caramel, gold dust, cacao nib crunch.',
          image: '/images/menu-dessert.png',
          price: 350,
          prepMinutes: 12
        },
        {
          name: 'Nightcap',
          slug: 'nightcap',
          category: 'drink',
          description: 'Gin, lemon, thyme.',
          image: '/images/menu-drink.png',
          price: 145,
          prepMinutes: 5
        }
      ];
    await MenuItem.insertMany(items);
    
    console.log('Database reset and re-seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
}

reset();

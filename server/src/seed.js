import MenuItem from './models/MenuItem.js';

export async function seedMenuIfEmpty() {
  const existingCount = await MenuItem.countDocuments();
  if (existingCount > 0) return;

  await MenuItem.insertMany([
    {
      name: 'Miyazaki Wagyu',
      slug: 'miyazaki-wagyu',
      category: 'Populärt',
      description: 'A5 Wagyu med tryffelsmor och rostade rodbetor.',
      image: '/images/hero-steak.png',
      price: 1250,
      lunchOfDay: true,
      prepMinutes: 25,
      position: 0
    },
    {
      name: 'Tartufo Pizza',
      slug: 'tartufo-pizza',
      category: 'Pizzor Klass 4',
      description: 'Svart tryffel, fior di latte, lagrad sojaglasyr, guldflingor.',
      image: '/images/menu-pizza.png',
      price: 650,
      prepMinutes: 18,
      position: 1
    },
    {
      name: 'Cosmic Chocolate',
      slug: 'cosmic-chocolate',
      category: 'Övrigt',
      description: 'Saltkaramell, guldstoft, kakaonib-crunch.',
      image: '/images/menu-dessert.png',
      price: 350,
      prepMinutes: 12,
      position: 2
    },
    {
      name: 'Nightcap',
      slug: 'nightcap',
      category: 'Drycker',
      description: 'Gin, citron, timjan.',
      image: '/images/menu-drink.png',
      price: 145,
      prepMinutes: 5,
      position: 3
    },
    {
      name: 'Pommes Frites',
      slug: 'pommes-frites',
      category: 'Övrigt',
      description: 'Krispiga pommes, lattsaltade.',
      image: '/images/menu-starter.png',
      price: 69,
      prepMinutes: 10,
      position: 4
    }
  ]);

  console.log('Menu seeded');
}


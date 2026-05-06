import MenuItem from './models/MenuItem.js';

export async function seedMenuIfEmpty() {
  // Clear existing menu to fix encoding issues
  await MenuItem.deleteMany({});

  await MenuItem.insertMany([
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
      description: 'Svart tryffel, fior di latte, lagrad sojaglasyr, guldflingor.',
      image: '/images/menu-pizza.png',
      price: 650,
      prepMinutes: 18
    },
    {
      name: 'Cosmic Chocolate',
      slug: 'cosmic-chocolate',
      category: 'dessert',
      description: 'Saltkaramell, guldstoft, kakaonib-crunch.',
      image: '/images/menu-dessert.png',
      price: 350,
      prepMinutes: 12
    },
    {
      name: 'Nightcap',
      slug: 'nightcap',
      category: 'drink',
      description: 'Gin, citron, timjan.',
      image: '/images/menu-drink.png',
      price: 145,
      prepMinutes: 5
    },
    {
      name: 'Pommes Frites',
      slug: 'pommes-frites',
      category: 'appetizer',
      description: 'Krispiga pommes, lättsaltade.',
      image: '/images/menu-starter.png',
      price: 69,
      prepMinutes: 10
    },
    {
      name: 'Sötpotatispommes',
      slug: 'sotpotatispommes',
      category: 'appetizer',
      description: 'Sötpotatispommes med örtkrydda.',
      image: '/images/menu-starter.png',
      price: 75,
      prepMinutes: 10
    },
    {
      name: 'Lökringar',
      slug: 'lokringar',
      category: 'appetizer',
      description: 'Friterade lökringar med aioli.',
      image: '/images/menu-starter.png',
      price: 75,
      prepMinutes: 10
    }
  ]);
  console.log('Menu re-seeded with UTF-8 characters');
}


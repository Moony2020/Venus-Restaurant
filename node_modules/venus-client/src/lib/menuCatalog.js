export const menuData = [
  {
    category: 'Populärt',
    slug: 'popular',
    items: [
      { id: 'popular_1', name: 'Vesuvio', description: 'Tomatsås, ost och skinka.', price: 139, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'popular_2', name: 'Capricciosa', description: 'Tomatsås, ost, skinka och champinjoner.', price: 145, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'popular_3', name: 'Kebabtallrik', description: 'Kebabkött med pommes, sallad och valfri sås.', price: 149, image: '/images/menu-duck.png', tags: ['popular'] },
      { id: 'popular_4', name: 'Mamma Mia', description: 'Tomatsås, ost, skinka, räkor och champinjoner.', price: 155, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'popular_5', name: 'Kycklingsallad', description: 'Isbergssallad med kyckling, majs och dressing.', price: 125, image: '/images/menu-starter.png', tags: ['popular'] },
      { id: 'popular_6', name: 'Nöt-Gyrospizza', description: 'Tomatsås, ost, gyros och kebabsås.', price: 159, image: '/images/menu-pizza.png', tags: ['popular'] }
    ]
  },
  {
    category: 'Förrätt',
    slug: 'starters',
    items: [
      { id: 'starter_1', name: 'Toast Skagen', description: 'Räkröra på smörstekt toast.', price: 99, image: '/images/menu-starter.png', tags: [] },
      { id: 'starter_2', name: 'Vitlöksbröd Special', description: 'Vitlöksbröd med ost och örter.', price: 69, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_3', name: 'Mozzarellasticks', description: 'Friterade mozzarellasticks med dip.', price: 79, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_4', name: 'Chiliräkor', description: 'Räkor i vitlök, chili och citron.', price: 109, image: '/images/menu-starter.png', tags: ['spicy'] },
      { id: 'starter_5', name: 'Lökringar', description: 'Krispiga lökringar med aioli.', price: 75, image: '/images/menu-starter.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'Pizzor Klass 1',
    slug: 'pizza1',
    items: [
      { id: 'pizza1_1', name: 'Margherita', description: 'Tomatsås och ost.', price: 135, image: '/images/menu-pizza.png', tags: ['vegetarian'] },
      { id: 'pizza1_2', name: 'Vesuvio', description: 'Tomatsås, ost och skinka.', price: 139, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza1_3', name: 'Funghi', description: 'Tomatsås, ost och champinjoner.', price: 139, image: '/images/menu-pizza.png', tags: ['vegetarian'] },
      { id: 'pizza1_4', name: 'Bolognese', description: 'Tomatsås, ost och köttfärssås.', price: 139, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza1_5', name: 'Calzone', description: 'Inbakad pizza med skinka och ost.', price: 142, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza1_6', name: 'Altonno', description: 'Tomatsås, ost och tonfisk.', price: 142, image: '/images/menu-pizza.png', tags: [] }
    ]
  },
  {
    category: 'Pizzor Klass 2',
    slug: 'pizza2',
    items: [
      { id: 'pizza2_1', name: 'Capricciosa', description: 'Tomatsås, ost, skinka och champinjoner.', price: 145, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza2_2', name: 'Hawaii', description: 'Tomatsås, ost, skinka och ananas.', price: 145, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza2_3', name: 'Romana', description: 'Tomatsås, ost, lök och bacon.', price: 149, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza2_4', name: 'Opera', description: 'Tomatsås, ost, skinka och tonfisk.', price: 149, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza2_5', name: 'La Bussola', description: 'Tomatsås, ost, skinka och räkor.', price: 149, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza2_6', name: 'Marinara', description: 'Tomatsås, ost, räkor och musslor.', price: 149, image: '/images/menu-pizza.png', tags: [] }
    ]
  },
  {
    category: 'Pizzor Klass 3',
    slug: 'pizza3',
    items: [
      { id: 'pizza3_1', name: 'Mamma Mia', description: 'Tomatsås, ost, skinka, räkor och champinjoner.', price: 155, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'pizza3_2', name: 'Disco', description: 'Tomatsås, ost, skinka, köttfärs och räkor.', price: 155, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza3_3', name: 'Vegetariana', description: 'Tomatsås, ost, paprika, lök och kronärtskocka.', price: 152, image: '/images/menu-pizza.png', tags: ['vegetarian'] },
      { id: 'pizza3_4', name: 'La Maffia', description: 'Tomatsås, ost, skinka, bacon och ägg.', price: 155, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza3_5', name: 'Jamaica', description: 'Tomatsås, ost, skinka, champinjoner och jalapeño.', price: 155, image: '/images/menu-pizza.png', tags: ['spicy'] },
      { id: 'pizza3_6', name: 'Quattro', description: 'Tomatsås, ost, skinka och fyra ostar.', price: 159, image: '/images/menu-pizza.png', tags: [] }
    ]
  },
  {
    category: 'Pizzor Klass 4',
    slug: 'pizza4',
    items: [
      { id: 'pizza4_1', name: 'Venus', description: 'Tomatsås, ost, fläskfilé och bearnaisesås.', price: 165, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'pizza4_2', name: 'Nöt-Gyrospizza', description: 'Tomatsås, ost, gyroskött och kebabsås.', price: 159, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza4_3', name: 'Kebabpizza', description: 'Tomatsås, ost, kebabkött, lök och feferoni.', price: 159, image: '/images/menu-pizza.png', tags: ['spicy'] },
      { id: 'pizza4_4', name: 'Africana', description: 'Tomatsås, ost, skinka, ananas och banan.', price: 159, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza4_5', name: 'Blecko', description: 'Tomatsås, ost, räkor och champinjoner.', price: 159, image: '/images/menu-pizza.png', tags: [] },
      { id: 'pizza4_6', name: 'Bari', description: 'Tomatsås, ost, lök och salami.', price: 159, image: '/images/menu-pizza.png', tags: [] }
    ]
  },
  {
    category: 'Special Pizzor',
    slug: 'special',
    items: [
      { id: 'special_1', name: 'Super Nöt-Gyrospizza', description: 'Gyros, kebabkött, lök, tomat och kebabsås.', price: 170, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'special_2', name: 'Tropicana', description: 'Skinka, fläskfilé, curry och bearnaisesås.', price: 170, image: '/images/menu-pizza.png', tags: [] },
      { id: 'special_3', name: 'Milan', description: 'Fläskfilé, champinjoner, jalapeño och texmexsås.', price: 172, image: '/images/menu-pizza.png', tags: ['spicy'] },
      { id: 'special_4', name: 'Miami', description: 'Kyckling, ananas, banan och curry.', price: 170, image: '/images/menu-pizza.png', tags: [] },
      { id: 'special_5', name: 'Nobis', description: 'Räkor, sparris, fläskfilé och bearnaisesås.', price: 175, image: '/images/menu-pizza.png', tags: [] },
      { id: 'special_6', name: 'Gorgonzola', description: 'Fläskfilé, lök, champinjoner och gorgonzola.', price: 175, image: '/images/menu-pizza.png', tags: [] }
    ]
  },
  {
    category: 'Oxfilépizzor',
    slug: 'oxfile',
    items: [
      { id: 'ox_1', name: 'Oxfilé Special', description: 'Oxfilé, champinjoner, lök och bearnaisesås.', price: 179, image: '/images/menu-pizza.png', tags: ['popular'] },
      { id: 'ox_2', name: 'Oxfilé Pepperoni', description: 'Oxfilé, pepperoni, paprika och lök.', price: 179, image: '/images/menu-pizza.png', tags: ['spicy'] },
      { id: 'ox_3', name: 'Oxfilé Toscana', description: 'Oxfilé, soltorkade tomater och ruccola.', price: 180, image: '/images/menu-pizza.png', tags: [] },
      { id: 'ox_4', name: 'Oxfilé Gorgonzola', description: 'Oxfilé, gorgonzola och rödlök.', price: 180, image: '/images/menu-pizza.png', tags: [] },
      { id: 'ox_5', name: 'Oxfilé Jalapeño', description: 'Oxfilé, jalapeño, vitlök och ost.', price: 179, image: '/images/menu-pizza.png', tags: ['spicy'] }
    ]
  },
  {
    category: 'Kebabrätter',
    slug: 'kebab',
    items: [
      { id: 'kebab_1', name: 'Kebabtallrik', description: 'Kebabkött, pommes, sallad och valfri sås.', price: 149, image: '/images/menu-duck.png', tags: ['popular'] },
      { id: 'kebab_2', name: 'Kycklingtallrik', description: 'Kycklingkebab med pommes och vitlökssås.', price: 145, image: '/images/menu-duck.png', tags: [] },
      { id: 'kebab_3', name: 'Kebabrulle', description: 'Tortillabröd med kebab, sallad och sås.', price: 145, image: '/images/menu-duck.png', tags: [] },
      { id: 'kebab_4', name: 'Kycklingrulle', description: 'Tortillabröd med kycklingkebab och sås.', price: 145, image: '/images/menu-duck.png', tags: [] },
      { id: 'kebab_5', name: 'Falafeltallrik', description: 'Falafel, pommes, sallad och mild sås.', price: 135, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'kebab_6', name: 'Falafelrulle', description: 'Falafel i tortillabröd med sallad och dressing.', price: 129, image: '/images/menu-starter.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'A la Carte',
    slug: 'alacarte',
    items: [
      { id: 'alacarte_1', name: 'Grillad Kycklingfilé', description: 'Serveras med klyftpotatis och pepparsås.', price: 179, image: '/images/menu-duck.png', tags: [] },
      { id: 'alacarte_2', name: 'Pannbiff', description: 'Med stekt lök, gräddsås och potatis.', price: 169, image: '/images/menu-duck.png', tags: [] },
      { id: 'alacarte_3', name: 'Schnitzel', description: 'Klassisk schnitzel med bearnaisesås och pommes.', price: 179, image: '/images/menu-duck.png', tags: ['popular'] },
      { id: 'alacarte_4', name: 'Fish & Chips', description: 'Friterad torsk med pommes och remoulad.', price: 165, image: '/images/menu-duck.png', tags: [] },
      { id: 'alacarte_5', name: 'Pasta Carbonara', description: 'Krämig pasta med bacon och parmesan.', price: 159, image: '/images/menu-duck.png', tags: [] }
    ]
  },
  {
    category: 'Övrigt',
    slug: 'others',
    items: [
      { id: 'other_1', name: 'Pommes Frites', description: 'Krispiga pommes, lättsaltade.', price: 69, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'other_2', name: 'Sötpotatispommes', description: 'Sötpotatispommes med örtkrydda.', price: 75, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'other_3', name: 'Nuggets 8 st', description: 'Kycklingnuggets med dippsås.', price: 89, image: '/images/menu-starter.png', tags: [] },
      { id: 'other_4', name: 'Lökringar', description: 'Friterade lökringar med aioli.', price: 75, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'other_5', name: 'Mozzarellasticks', description: 'Serveras med chilisås.', price: 79, image: '/images/menu-starter.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'Sallader',
    slug: 'salads',
    items: [
      { id: 'salad_1', name: 'Grekisk Sallad', description: 'Fetaost, oliver, tomat, gurka och rödlök.', price: 119, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'salad_2', name: 'Kycklingsallad', description: 'Kyckling, salladsmix, majs och dressing.', price: 125, image: '/images/menu-starter.png', tags: ['popular'] },
      { id: 'salad_3', name: 'Tonfisksallad', description: 'Tonfisk, ägg, tomat, gurka och lök.', price: 125, image: '/images/menu-starter.png', tags: [] },
      { id: 'salad_4', name: 'Räksallad', description: 'Räkor, ägg, salladsmix och citron.', price: 129, image: '/images/menu-starter.png', tags: [] },
      { id: 'salad_5', name: 'Halloumisallad', description: 'Grillad halloumi, paprika och balsamico.', price: 129, image: '/images/menu-starter.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'Såser',
    slug: 'sauces',
    items: [
      { id: 'sauce_1', name: 'Kebabsås Mild', description: 'Klassisk mild kebabsås.', price: 65, image: '/images/menu-drink.png', tags: [] },
      { id: 'sauce_2', name: 'Kebabsås Stark', description: 'Stark kebabsås med chili.', price: 65, image: '/images/menu-drink.png', tags: ['spicy'] },
      { id: 'sauce_3', name: 'Vitlökssås', description: 'Krämig vitlökssås.', price: 65, image: '/images/menu-drink.png', tags: ['vegetarian'] },
      { id: 'sauce_4', name: 'Bearnaisesås', description: 'Klassisk bearnaise.', price: 69, image: '/images/menu-drink.png', tags: [] },
      { id: 'sauce_5', name: 'Tzatziki', description: 'Yoghurt, gurka och vitlök.', price: 69, image: '/images/menu-drink.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'Drycker',
    slug: 'drinks',
    items: [
      { id: 'drink_1', name: 'Coca-Cola 33cl', description: 'Kall läsk.', price: 65, image: '/images/menu-drink.png', tags: ['popular'] },
      { id: 'drink_2', name: 'Coca-Cola Zero 33cl', description: 'Sockerfri läsk.', price: 65, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_3', name: 'Fanta Orange 33cl', description: 'Kolsyrad läsk med apelsinsmak.', price: 65, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_4', name: 'Sprite 33cl', description: 'Citrusläsk serverad kall.', price: 65, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_5', name: 'Mineralvatten 50cl', description: 'Kolsyrat vatten.', price: 65, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_6', name: 'Ayran 25cl', description: 'Yoghurtdryck, perfekt till kebab.', price: 69, image: '/images/menu-drink.png', tags: [] }
    ]
  }
];

export const MENU_CATEGORIES = menuData.map((section) => ({
  id: section.slug,
  label: section.category
}));

export const MENU_TAG_FILTERS = [
  { id: 'all', label: 'Alla' },
  { id: 'popular', label: 'Populär' },
  { id: 'vegetarian', label: 'Vegetarisk' },
  { id: 'spicy', label: 'Stark' }
];

export const MENU_ITEMS = menuData.flatMap((section) =>
  section.items.map((item) => ({
    _id: item.id,
    category: section.slug,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    tags: item.tags || []
  }))
);


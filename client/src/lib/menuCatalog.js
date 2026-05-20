const COMMON_EXTRAS = [
  { id: 'pizzasallad', label: 'Pizzasallad', price: 20 },
  { id: 'pommes', label: 'Pommes', price: 20 },
  { id: 'bacon', label: 'Bacon', price: 20 },
  { id: 'ost', label: 'Extra Ost', price: 10 },
  { id: 'kottfars', label: 'Köttfärs', price: 20 },
  { id: 'skinka', label: 'Skinka', price: 20 },
  { id: 'salami', label: 'Salami', price: 20 },
  { id: 'ananas', label: 'Ananas', price: 10 },
  { id: 'tonfisk', label: 'Tonfisk', price: 20 },
  { id: 'curry', label: 'Curry', price: 10 },
  { id: 'agg', label: 'Ägg', price: 10 },
  { id: 'oliver', label: 'Oliver', price: 10 },
  { id: 'kyckling', label: 'Kyckling', price: 20 },
  { id: 'isbergssallad', label: 'Isbergssallad', price: 10 },
  { id: 'banan', label: 'Banan', price: 10 },
  { id: 'paprika', label: 'Paprika', price: 10 },
  { id: 'lok', label: 'Lök', price: 10 },
  { id: 'tomater', label: 'Tomater', price: 10 },
  { id: 'rakor', label: 'Räkor', price: 20 },
  { id: 'feferoni', label: 'Feferoni', price: 10 },
  { id: 'flaskfile', label: 'Fläskfilé', price: 20 },
  { id: 'kebabkott', label: 'Kebabkött', price: 20 },
  { id: 'oxfile', label: 'Oxfilé', price: 20 },
  { id: 'champinjoner', label: 'Champinjoner', price: 10 }
];

const MEAT_CHOICE = {
  id: 'meat',
  label: 'Välj kött',
  type: 'radio',
  required: true,
  description: 'Välj 1',
  options: [
    { id: 'notkott', label: 'Nötkött', price: 0 },
    { id: 'gyros', label: 'Gyros', price: 0 }
  ]
};

const SAUCE_CHOICE = {
  id: 'sauce',
  label: 'Välj sås',
  type: 'radio',
  required: true,
  options: [
    { id: 'mild', label: 'Mild sås', price: 0 },
    { id: 'stark', label: 'Stark sås', price: 0 },
    { id: 'vitlok', label: 'Vitlökssås', price: 0 },
    { id: 'blandad', label: 'Blandad sås', price: 0 }
  ]
};

const GLUTEN_FREE = {
  id: 'glutenfree',
  label: 'Glutenfri?',
  type: 'checkbox',
  required: false,
  description: 'Välj upp till 1 (valfritt)',
  options: [
    { id: 'gf', label: 'Glutenfri botten', price: 35 }
  ]
};

const POPULAR_PAIRS = {
  id: 'popular_pairs',
  label: 'Kombineras ofta med',
  type: 'checkbox',
  required: false,
  description: 'Andra i din omgivning gillade detta',
  options: [
    { id: 'sauce_bea', label: 'Bearnaisesås', price: 20 },
    { id: 'sauce_vitlok', label: 'Vitlökssås', price: 20 },
    { id: 'sauce_mild', label: 'Mild Sås', price: 20 }
  ]
};

const EXTRAS_SECTION = {
  id: 'extras',
  label: 'Extra ingredienser',
  type: 'checkbox',
  required: false,
  description: 'Välj upp till 10 (valfritt)',
  options: COMMON_EXTRAS
};

export const menuData = [
  {
    category: 'Populärt',
    slug: 'popular',
    items: [
      { id: 'popular_1', name: 'Vesuvio', description: 'Tomatsås, ost och skinka.', price: 139, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'popular_2', name: 'Capricciosa', description: 'Tomatsås, ost, skinka och champinjoner.', price: 145, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'popular_3', name: 'Kebabtallrik', description: 'Kebabkött med pommes, sallad och valfri sås.', price: 149, image: '/images/menu-duck.png', tags: ['popular'], customizations: [MEAT_CHOICE, SAUCE_CHOICE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'popular_4', name: 'Mamma Mia', description: 'Tomatsås, ost, skinka, räkor och champinjoner.', price: 155, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'popular_5', name: 'Kycklingsallad', description: 'Isbergssallad med kyckling, majs och dressing.', price: 125, image: '/images/menu-starter.png', tags: ['popular'], customizations: [EXTRAS_SECTION] },
      { id: 'popular_6', name: 'Nöt-Gyrospizza', description: 'Tomatsås, ost, gyros/nötköttskebab och kebabsås.', price: 159, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [MEAT_CHOICE, GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Förrätt',
    slug: 'starters',
    items: [
      { id: 'starter_1', name: 'Toast Skagen', description: 'Räkröra på smörstekt toast.', price: 99, image: '/images/menu-starter.png', tags: [] },
      { id: 'starter_1b', name: 'Tzatziki med bröd', description: 'Krämig tzatziki serverad med varmt bröd.', price: 69, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_2', name: 'Vitlöksbröd Special', description: 'Vitlöksbröd med ost och örter.', price: 69, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_3', name: 'Mozzarellasticks', description: 'Serveras med chilisås.', price: 79, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_4', name: 'Chiliräkor', description: 'Räkor i vitlök, chili och citron.', price: 109, image: '/images/menu-starter.png', tags: ['spicy'] },
      { id: 'starter_5', name: 'Lökringar', description: 'Friterade lökringar med aioli.', price: 75, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_6', name: 'Tartar på Oxfilé', description: 'Klassisk tartar på finhackad oxfilé serverad med kapris, lök och äggula.', price: 195, image: '/images/menu-tartar.png', tags: ['popular'] },
      { id: 'starter_7', name: 'Pommes Frites', description: 'Krispiga pommes, lättsaltade.', price: 69, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_8', name: 'Sötpotatispommes', description: 'Sötpotatispommes med örtkrydda.', price: 75, image: '/images/menu-starter.png', tags: ['vegetarian'] },
      { id: 'starter_9', name: 'Nuggets 8 st', description: 'Kycklingnuggets med dippsås.', price: 89, image: '/images/menu-starter.png', tags: [] }
    ]
  },
  {
    category: 'Pizzor Klass 1',
    slug: 'pizza1',
    items: [
      { id: 'pizza1_1', name: 'Margherita', description: 'Tomatsås och ost.', price: 135, image: '/images/menu-pizza.png', tags: ['vegetarian'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza1_2', name: 'Vesuvio', description: 'Tomatsås, ost och skinka.', price: 139, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza1_3', name: 'Funghi', description: 'Tomatsås, ost och champinjoner.', price: 139, image: '/images/menu-pizza.png', tags: ['vegetarian'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza1_4', name: 'Bolognese', description: 'Tomatsås, ost och köttfärssås.', price: 139, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza1_5', name: 'Calzone', description: 'Inbakad pizza med skinka och ost.', price: 142, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza1_6', name: 'Altonno', description: 'Tomatsås, ost och tonfisk.', price: 142, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Pizzor Klass 2',
    slug: 'pizza2',
    items: [
      { id: 'pizza2_1', name: 'Capricciosa', description: 'Tomatsås, ost, skinka och champinjoner.', price: 145, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza2_2', name: 'Hawaii', description: 'Tomatsås, ost, skinka och ananas.', price: 145, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza2_3', name: 'Romana', description: 'Tomatsås, ost, lök och bacon.', price: 149, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza2_4', name: 'Opera', description: 'Tomatsås, ost, skinka och tonfisk.', price: 149, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza2_5', name: 'La Bussola', description: 'Tomatsås, ost, skinka och räkor.', price: 149, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza2_6', name: 'Marinara', description: 'Tomatsås, ost, räkor och musslor.', price: 149, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Pizzor Klass 3',
    slug: 'pizza3',
    items: [
      { id: 'pizza3_1', name: 'Mamma Mia', description: 'Tomatsås, ost, skinka, räkor och champinjoner.', price: 155, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza3_2', name: 'Disco', description: 'Tomatsås, ost, skinka, köttfärs och räkor.', price: 155, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza3_3', name: 'Vegetariana', description: 'Tomatsås, ost, paprika, lök och kronärtskocka.', price: 152, image: '/images/menu-pizza.png', tags: ['vegetarian'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza3_4', name: 'La Maffia', description: 'Tomatsås, ost, skinka, bacon och ägg.', price: 155, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza3_5', name: 'Jamaica', description: 'Tomatsås, ost, skinka, champinjoner och jalapeño.', price: 155, image: '/images/menu-pizza.png', tags: ['spicy'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza3_6', name: 'Quattro', description: 'Tomatsås, ost, skinka och fyra ostar.', price: 159, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Pizzor Klass 4',
    slug: 'pizza4',
    items: [
      { id: 'pizza4_1', name: 'Venus', description: 'Tomatsås, ost, fläskfilé och bearnaisesås.', price: 165, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza4_2', name: 'Nöt-Gyrospizza', description: 'Tomatsås, ost, gyros/nötköttskebab och kebabsås.', price: 159, image: '/images/menu-pizza.png', tags: [], customizations: [MEAT_CHOICE, GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza4_3', name: 'Kebabpizza', description: 'Tomatsås, ost, gyros/nötköttskebab, lök och feferoni.', price: 159, image: '/images/menu-pizza.png', tags: ['spicy'], customizations: [MEAT_CHOICE, GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza4_4', name: 'Africana', description: 'Tomatsås, ost, skinka, ananas och banan.', price: 159, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza4_5', name: 'Blecko', description: 'Tomatsås, ost, räkor och champinjoner.', price: 159, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'pizza4_6', name: 'Bari', description: 'Tomatsås, ost, lök och salami.', price: 159, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Special Pizzor',
    slug: 'special',
    items: [
      { id: 'special_1', name: 'Super Nöt-Gyrospizza', description: 'Gyros/nötköttskebab, lök, tomat och kebabsås.', price: 170, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [MEAT_CHOICE, GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_2', name: 'Tropicana', description: 'Skinka, fläskfilé, curry och bearnaisesås.', price: 170, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_3', name: 'Milan', description: 'Fläskfilé, champinjoner, jalapeño och texmexsås.', price: 172, image: '/images/menu-pizza.png', tags: ['spicy'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_4', name: 'Miami', description: 'Kyckling, ananas, banan och curry.', price: 170, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_5', name: 'Nobis', description: 'Räkor, sparris, fläskfilé och bearnaisesås.', price: 175, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_6', name: 'Gorgonzola', description: 'Tomatsås, ost, champinjoner, lök, fläskfilé och gorgonzolaost.', price: 170, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'special_7', name: 'Pizza Aurora', description: 'Vit pizza med tryffelkräm, fior di latte, parmaskinka och krossade pistagenötter.', price: 215, image: '/images/menu-pizza-aurora.png', tags: ['popular'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Oxfilépizzor',
    slug: 'oxfile',
    items: [
      { id: 'ox_1', name: 'Oxfilé Special', description: 'Oxfilé, champinjoner, lök och bearnaisesås.', price: 179, image: '/images/menu-pizza.png', tags: ['popular'], customizations: [SAUCE_CHOICE, GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'ox_2', name: 'Oxfilé Pepperoni', description: 'Oxfilé, pepperoni, paprika och lök.', price: 179, image: '/images/menu-pizza.png', tags: ['spicy'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'ox_3', name: 'Oxfilé Toscana', description: 'Oxfilé, soltorkade tomater och ruccola.', price: 180, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'ox_4', name: 'Oxfilé Gorgonzola', description: 'Oxfilé, gorgonzola och rödlök.', price: 180, image: '/images/menu-pizza.png', tags: [], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] },
      { id: 'ox_5', name: 'Oxfilé Jalapeño', description: 'Oxfilé, jalapeño, vitlök och ost.', price: 179, image: '/images/menu-pizza.png', tags: ['spicy'], customizations: [GLUTEN_FREE, EXTRAS_SECTION, POPULAR_PAIRS] }
    ]
  },
  {
    category: 'Kebabrätter',
    slug: 'kebab',
    items: [
      { id: 'kebab_1', name: 'Kebabtallrik', description: 'Kebabkött, pommes, sallad och valfri sås.', price: 149, image: '/images/menu-duck.png', tags: [], customizations: [MEAT_CHOICE, SAUCE_CHOICE, EXTRAS_SECTION] },
      { id: 'kebab_2', name: 'Kycklingtallrik', description: 'Kycklingkebab med pommes och vitlökssås.', price: 145, image: '/images/menu-duck.png', tags: [], customizations: [SAUCE_CHOICE, EXTRAS_SECTION] },
      { id: 'kebab_3', name: 'Kebabrulle', description: 'Tortillabröd med kebab, sallad och sås.', price: 145, image: '/images/menu-duck.png', tags: [], customizations: [MEAT_CHOICE, SAUCE_CHOICE, EXTRAS_SECTION] },
      { id: 'kebab_4', name: 'Kycklingrulle', description: 'Tortillabröd med kycklingkebab och sås.', price: 145, image: '/images/menu-duck.png', tags: [], customizations: [SAUCE_CHOICE, EXTRAS_SECTION] },
      { id: 'kebab_5', name: 'Falafeltallrik', description: 'Falafel, pommes, sallad och mild sås.', price: 135, image: '/images/menu-starter.png', tags: ['vegetarian'], customizations: [SAUCE_CHOICE, EXTRAS_SECTION] },
      { id: 'kebab_6', name: 'Falafelrulle', description: 'Falafel i tortillabröd med sallad och dressing.', price: 129, image: '/images/menu-starter.png', tags: ['vegetarian'], customizations: [SAUCE_CHOICE, EXTRAS_SECTION] }
    ]
  },
  {
    category: 'A la Carte',
    slug: 'alacarte',
    items: [
      { id: 'alacarte_1', name: 'Grillad Kycklingfilé', description: 'Serveras med klyftpotatis och pepparsås.', price: 179, image: '/images/menu-duck.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'alacarte_2', name: 'Pannbiff', description: 'Med stekt lök, gräddsås och potatis.', price: 169, image: '/images/menu-duck.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'alacarte_3', name: 'Schnitzel', description: 'Klassisk schnitzel med bearnaisesås och pommes.', price: 179, image: '/images/menu-duck.png', tags: ['popular'], customizations: [EXTRAS_SECTION] },
      { id: 'alacarte_4', name: 'Fish & Chips', description: 'Friterad torsk med pommes och remoulad.', price: 165, image: '/images/menu-duck.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'alacarte_5', name: 'Pasta Carbonara', description: 'Krämig pasta med bacon och parmesan.', price: 159, image: '/images/menu-duck.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'alacarte_6', name: 'Vildfångad Röding', description: 'Serveras med sandefjordsås, dillolja, forellrom och smörslungad smålpotatis från lokala odlare i trakten.', price: 345, image: '/images/menu-char.png', tags: ['popular'] },
      { id: 'alacarte_7', name: 'Entrecôte Venus', description: '30 dagars hängmörad ryggbiff, serveras med tryffelsmör, rödvinsky och krispig jordärtskocka.', price: 425, image: '/images/menu-entrecote.png', tags: ['popular'] },
      { id: 'alacarte_8', name: 'Skogens Guld Pasta', description: 'Hemgjord tagliatelle med färska kantareller, lagrad parmesan och en touch av svartpeppar.', price: 285, image: '/images/menu-chanterelle.png', tags: ['popular'] },
      { id: 'alacarte_9', name: 'Stjärnstoft & Hav', description: 'Hängmörad ryggbiff stekt över björkved, rödvinsreduktion, handskurna pommes och ugnsbakade smålökar.', price: 1295, image: '/images/menu-ribeye-sig.png', tags: ['popular'] }
    ]
  },
  {
    category: 'Övrigt',
    slug: 'others',
    items: [
      { id: 'other_6', name: 'Mörk Chokladmousse', description: 'Himmelskt len chokladmousse i kristallglas med 70% kakaohalt, hallon och guldflarn.', price: 125, image: '/images/menu-chocolate.png', tags: ['vegetarian', 'popular'] }
    ]
  },
  {
    category: 'Sallader',
    slug: 'salads',
    items: [
      { id: 'salad_1', name: 'Grekisk Sallad', description: 'Fetaost, oliver, tomat, gurka och rödlök.', price: 119, image: '/images/menu-starter.png', tags: ['vegetarian'], customizations: [EXTRAS_SECTION] },
      { id: 'salad_2', name: 'Kycklingsallad', description: 'Kyckling, salladsmix, majs och dressing.', price: 125, image: '/images/menu-starter.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'salad_3', name: 'Tonfisksallad', description: 'Tonfisk, ägg, tomat, gurka och lök.', price: 125, image: '/images/menu-starter.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'salad_4', name: 'Räksallad', description: 'Räkor, ägg, salladsmix och citron.', price: 129, image: '/images/menu-starter.png', tags: [], customizations: [EXTRAS_SECTION] },
      { id: 'salad_5', name: 'Halloumisallad', description: 'Grillad halloumi, paprika och balsamico.', price: 129, image: '/images/menu-starter.png', tags: ['vegetarian'], customizations: [EXTRAS_SECTION] }
    ]
  },
  {
    category: 'Såser',
    slug: 'sauces',
    items: [
      { id: 'sauce_mild', name: 'Mild Sås', description: 'En krämig sås med en balanserad smak, perfekt för att förhöja rätter.', price: 20, image: '/images/menu-drink.png', tags: [] },
      { id: 'sauce_stark', name: 'Stark Sås', description: 'Kryddig sås med hetta, perfekt för att förhöja smaken på olika rätter.', price: 20, image: '/images/menu-drink.png', tags: ['spicy'] },
      { id: 'sauce_vitlok', name: 'Vitlökssås', description: 'Kryddig sås med vitlök, perfekt för att förhöja smaken på olika rätter.', price: 20, image: '/images/menu-drink.png', tags: ['vegetarian'] },
      { id: 'sauce_blandad', name: 'Blandadsås', description: 'Kryddig sås med tomat, lök och örter, perfekt till kött eller grönsaker.', price: 20, image: '/images/menu-drink.png', tags: [] },
      { id: 'sauce_bea', name: 'Bearnaisesås', description: 'Klassisk sås med smör, äggula, vinäger och örter, perfekt till kött och grillat.', price: 20, image: '/images/menu-drink.png', tags: [] },
      { id: 'sauce_tzatziki', name: 'Tzatziki', description: 'Yoghurt, gurka och vitlök.', price: 20, image: '/images/menu-drink.png', tags: ['vegetarian'] }
    ]
  },
  {
    category: 'Drycker',
    slug: 'drinks',
    items: [
      { id: 'drink_1', name: 'Coca-Cola 33cl', description: 'Kall läsk.', price: 25, image: '/images/menu-drink.png', tags: ['popular'] },
      { id: 'drink_2', name: 'Coca-Cola Zero 33cl', description: 'Sockerfri läsk.', price: 25, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_3', name: 'Fanta Orange 33cl', description: 'Kolsyrad läsk med apelsinsmak.', price: 25, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_4', name: 'Sprite 33cl', description: 'Citrusläsk serverad kall.', price: 25, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_5', name: 'Mineralvatten 50cl', description: 'Kolsyrat vatten.', price: 25, image: '/images/menu-drink.png', tags: [] },
      { id: 'drink_6', name: 'Ayran 25cl', description: 'Yoghurtdryck, perfekt till kebab.', price: 25, image: '/images/menu-drink.png', tags: [] }
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
    tags: item.tags || [],
    customizations: item.customizations || []
  }))
);

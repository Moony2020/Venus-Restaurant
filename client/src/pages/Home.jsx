import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import ReservationSection from '../components/home/ReservationSection';
import SiteHeader from '../layout/SiteHeader';
import OpeningHoursDropdown from '../components/menu/OpeningHoursDropdown';
import { useCart } from '../context/CartContext';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';
import { MENU_ITEMS } from '../lib/menuCatalog';
import { Sparkles, Star, Quote, ChevronRight, Flame, Leaf } from 'lucide-react';

const TABS = [
  { id: 'starters', label: 'Förrätter', categories: ['starters'] },
  { id: 'alacarte', label: 'Varmrätter', categories: ['alacarte'] },
  { id: 'pizzor', label: 'Pizzor', categories: ['special', 'pizza1', 'pizza2', 'pizza3', 'pizza4', 'oxfile'] },
  { id: 'others', label: 'Desserter & Dryck', categories: ['others', 'drinks'] }
];

const tagMap = {
  popular: { label: 'Populär', icon: Flame, className: 'bg-pink-500/20 text-pink-300 border-pink-400/30' },
  vegetarian: { label: 'Vegetarisk', icon: Leaf, className: 'bg-green-500/20 text-green-300 border-green-400/30' },
  spicy: { label: 'Stark', icon: Flame, className: 'bg-orange-500/20 text-orange-300 border-orange-400/30' }
};

const CUSTOM_ASPECTS = {
  // Starters (Appetizers)
  'starter_6': 'aspect-[3/2]',  // Tartar (Wide)
  'starter_1': 'aspect-[3/4]',  // Toast Skagen (Tall)
  'starter_1b': 'aspect-[3/4]', // Tzatziki (Tall)
  'starter_2': 'aspect-[16/9]', // Vitlöksbröd (Very Wide)
  'starter_3': 'aspect-[3/2]',  // Mozzarellasticks (Wide)
  'starter_4': 'aspect-[3/4]',  // Chiliräkor (Tall)

  // Varmrätter (Main dishes)
  'alacarte_3': 'aspect-[3/4]',  // Schnitzel (Tall)
  'alacarte_6': 'aspect-[3/2]',  // Röding (Wide)
  'alacarte_7': 'aspect-[3/2]',  // Entrecôte (Wide) -> USER EXPLICIT REQUEST
  'alacarte_8': 'aspect-[3/4]',  // Skogens Guld (Tall)
  'alacarte_1': 'aspect-[3/4]',  // Grillad Kycklingfilé (Tall)
  'alacarte_2': 'aspect-[3/2]',  // Pannbiff (Wide)

  // Other specific items
  'special_7': 'aspect-[3/2]'   // Pizza Aurora (Wide)
};

const PremiumMenuCard = ({ item, quantityInCart, onAdd, isOpen, direction, index }) => {
  const disabled = !isOpen || item.available === false;

  const aspectClass = useMemo(() => {
    const id = item._id || item.id;
    if (CUSTOM_ASPECTS[id]) {
      return CUSTOM_ASPECTS[id];
    }

    // Fallback checkerboard if not custom defined
    if (typeof index === 'number') {
      const globalIndex = index % 6;
      if (globalIndex === 0) return 'aspect-[3/2]';  // Wide
      if (globalIndex === 1) return 'aspect-[3/4]';  // Tall
      if (globalIndex === 2) return 'aspect-[3/4]';  // Tall
      if (globalIndex === 3) return 'aspect-[16/9]'; // Very Wide
      if (globalIndex === 4) return 'aspect-[3/2]';  // Wide
      if (globalIndex === 5) return 'aspect-[3/4]';  // Tall
    }

    // Stable pseudo-random fallback based on ID string
    const charSum = String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return charSum % 2 === 0 ? 'aspect-[4/3]' : 'aspect-[4/5]';
  }, [item, index]);

  return (
    <article
      data-menu-item-id={item._id}
      onClick={() => !disabled && onAdd(item)}
      className={`group flex flex-col w-full max-w-[380px] sm:max-w-[360px] text-left transition-opacity duration-300 mx-auto ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${direction === 'left' ? 'sm:ml-auto sm:mr-0' : 'sm:mr-auto sm:ml-0'
        }`}
    >
      {/* Premium Food Image Wrapper */}
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-2xl`}>
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* Dark vignette gradient overlay for price text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Floating Glassmorphic Price Badge */}
        <div className="absolute bottom-4 right-4 rounded border border-white/10 bg-black/55 backdrop-blur-md px-3.5 py-1.5 text-[12px] sm:text-[13px] font-bold tracking-widest text-white shadow-lg uppercase font-display">
          {item.price} KR
        </div>
      </div>

      {/* Gourmet Dish Details */}
      <div className="flex flex-col mt-4">
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tags.map((tag) => {
              const meta = tagMap[tag];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 text-[9px] uppercase tracking-wider ${meta.className}`}
                >
                  <Icon size={9} /> {meta.label}
                </span>
              );
            })}
          </div>
        )}

        <h3 className="font-display text-2xl md:text-3xl text-white group-hover:text-gold transition-colors duration-300 tracking-wide leading-tight font-medium">
          {item.name}
        </h3>

        <p className="mt-2.5 text-white/55 font-light text-[13px] sm:text-[14px] leading-relaxed max-w-xl">
          {item.description}
        </p>

        {/* Premium interactive button */}
        <div className={`inline-flex items-center gap-3 mt-4 group/btn ${disabled ? 'pointer-events-none' : ''}`}>
          {direction === 'left' && (
            <span className="w-8 h-[1px] bg-gold group-hover/btn:w-12 transition-all duration-300 shrink-0" />
          )}

          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-goldSoft group-hover/btn:text-white transition-colors duration-300 whitespace-nowrap">
            LÄGG TILL I KORG
          </span>

          {quantityInCart > 0 && (
            <span className="bg-gold text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-full leading-none transition-transform group-hover/btn:scale-110">
              {quantityInCart}
            </span>
          )}

          {direction === 'right' && (
            <span className="w-8 h-[1px] bg-gold group-hover/btn:w-12 transition-all duration-300 shrink-0" />
          )}
        </div>
      </div>
    </article>
  );
};

const Home = () => {
  const { addToCart, items: cartItems } = useCart();
  const { data: restaurantStatus } = useRestaurantStatus();
  const isOpen = restaurantStatus?.nowStatus?.isOpen ?? true;
  const [activeTab, setActiveTab] = useState('alacarte');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    const updateIndicator = () => {
      const activeTabEl = tabRefs.current[activeTab];
      const containerEl = containerRef.current;
      if (activeTabEl && containerEl) {
        const left = activeTabEl.offsetLeft;
        const width = activeTabEl.offsetWidth;
        setIndicatorStyle({
          left: left,
          width: width,
          opacity: 1
        });
      }
    };

    updateIndicator();
    const timeoutId = setTimeout(updateIndicator, 50);

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Compute quantities in cart to pass to MenuCard components
  const quantitiesByItemId = useMemo(() => {
    const map = {};
    cartItems.forEach((item) => {
      const baseId = item._id || item.id;
      map[baseId] = (map[baseId] || 0) + item.quantity;
    });
    return map;
  }, [cartItems]);

  // Signature dish data lookup
  const signatureDish = useMemo(() => {
    return MENU_ITEMS.find(item => item._id === 'alacarte_9') || {
      _id: 'alacarte_9',
      id: 'alacarte_9',
      name: 'Stjärnstoft & Hav',
      price: 1295,
      image: '/images/menu-ribeye-sig.png',
      category: 'alacarte',
      description: 'Hängmörad ryggbiff stekt över björkved, rödvinsreduktion, handskurna pommes och ugnsbakade smålökar.'
    };
  }, []);

  // Filter and sort items to display in the main grid
  const filteredItems = useMemo(() => {
    const activeTabObj = TABS.find(t => t.id === activeTab);
    if (!activeTabObj) return [];

    const items = MENU_ITEMS.filter(item =>
      activeTabObj.categories.includes(item.category) &&
      item._id !== 'alacarte_9' // Exclude signature dish from grid
    );

    // Prioritize popular items first
    return items.sort((a, b) => {
      const aPop = a.tags?.includes('popular') ? 1 : 0;
      const bPop = b.tags?.includes('popular') ? 1 : 0;
      return bPop - aPop;
    }).slice(0, 6);
  }, [activeTab]);

  const leftColumnItems = useMemo(() => filteredItems.filter((_, idx) => idx % 2 === 0), [filteredItems]);
  const rightColumnItems = useMemo(() => filteredItems.filter((_, idx) => idx % 2 === 1), [filteredItems]);

  return (
    <main className="min-h-screen bg-[#070b11] text-white">
      <SiteHeader />

      <div className="relative">
        {/* Floating Status Bar Overlay */}
        <div className="absolute right-4 top-4 z-40 scale-90 transform-gpu origin-top-right">
          {restaurantStatus?.week && (
            <OpeningHoursDropdown
              week={restaurantStatus.week}
              statusText={restaurantStatus?.nowStatus?.text}
              isOpen={restaurantStatus?.nowStatus?.isOpen}
              isRollover={restaurantStatus?.nowStatus?.isRollover}
            />
          )}
        </div>

        <HeroSection />
      </div>

      {/* 1. Kockens Val (Signature Section) */}
      <section className="reveal relative py-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center mb-2">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-3 block">
            Mästarens Stolthet
          </span>
          <h2 className="font-display text-3xl min-[481px]:text-4xl md:text-5xl lg:text-6xl text-white">
            Kockens Val
          </h2>
          <div className="w-16 h-0.5 bg-gold/50 mx-auto mt-4" />
        </div>

        <div className="grid min-[993px]:grid-cols-12 gap-8 min-[993px]:gap-12 items-start">
          {/* Left: Premium image container */}
          <div className="min-[993px]:col-span-6 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-amber-500/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-[4/3] sm:aspect-[16/9] min-[993px]:aspect-[4/3]">
              <img
                src={signatureDish.image}
                alt={signatureDish.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Glassmorphic Badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold">
                <Sparkles size={11} className="animate-pulse" /> Signaturrätt
              </div>
            </div>
          </div>

          {/* Right: Signature Description */}
          <div className="min-[993px]:col-span-6 flex flex-col">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-gold/80 mb-2">
              EN GASTRO-UPPLEVELSE UTÖVER DET VANLIGA
            </span>
            <h3 className="font-display text-3xl sm:text-4xl md:text-4xl min-[993px]:text-5xl text-white mb-4 leading-tight">
              {signatureDish.name}
            </h3>

            <p className="text-white/70 text-base leading-relaxed mb-6">
              {signatureDish.description}
            </p>

            {/* Gold star bullets */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-[14px] text-white/80">
                <Star size={16} className="text-gold shrink-0 mt-0.5 fill-gold/20" />
                <span><strong className="text-white font-medium">Svensk Premium Wagyu:</strong> Hängmörad ryggbiff stekt till absolut perfektion över björkvedsglöd.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white/80">
                <Star size={16} className="text-gold shrink-0 mt-0.5 fill-gold/20" />
                <span><strong className="text-white font-medium">36h Rödvinsreduktion:</strong> Kockens mustiga signaturreduktion kokad under 36 timmar på oxmärg och färska primörer.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white/80">
                <Star size={16} className="text-gold shrink-0 mt-0.5 fill-gold/20" />
                <span><strong className="text-white font-medium">Krispiga Tryffelpommes:</strong> Handskurna pommes frites slungade med havssalt och finaste tryffelolja.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white/80">
                <Star size={16} className="text-gold shrink-0 mt-0.5 fill-gold/20" />
                <span><strong className="text-white font-medium">Karamelliserad Smålök:</strong> Ugnsbakade smålökar, långsamt bräserade i timjan och brynt smör.</span>
              </li>
            </ul>

            <div className="flex flex-row items-end justify-start gap-4 sm:gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Exklusivt Pris</span>
                <span className="font-display text-3xl sm:text-4xl text-gold font-semibold">{signatureDish.price} kr</span>
              </div>

              <button
                onClick={() => isOpen && addToCart(signatureDish)}
                disabled={!isOpen}
                className={`w-auto shrink-0 rounded-full bg-gold hover:bg-goldSoft hover:scale-105 active:scale-95 transition-all duration-300 text-black text-[11px] font-bold uppercase tracking-[0.18em] px-6 sm:px-10 py-3.5 sm:py-4 text-center flex items-center justify-center gap-2.5 shadow-2xl shadow-gold/15 ${!isOpen ? 'opacity-40 cursor-not-allowed hover:bg-gold hover:scale-100' : ''
                  }`}
              >
                <span className="whitespace-nowrap">LÄGG TILL I KORG</span>
                {isOpen && quantitiesByItemId[signatureDish._id] > 0 && (
                  <span className="bg-black text-white text-[9px] font-bold px-2.5 py-1 rounded-full text-[10px] leading-none">
                    {quantitiesByItemId[signatureDish._id]}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Separator Ornament */}
      <div className="w-full flex items-center justify-center gap-4 py-8 opacity-30">
        <div className="w-32 h-px bg-gradient-to-r from-transparent to-gold" />
        <Star size={12} className="text-gold animate-[spin_20s_linear_infinite]" />
        <Star size={16} className="text-gold animate-pulse fill-gold/30" />
        <Star size={12} className="text-gold animate-[spin_20s_linear_infinite_reverse]" />
        <div className="w-32 h-px bg-gradient-to-l from-transparent to-gold" />
      </div>

      {/* 2. Featured Grid Section */}
      <section id="featured-section" className="reveal relative py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-3 block">
            VÅR GOURMETMENY
          </span>
          <h2 className="font-display text-3xl min-[481px]:text-4xl md:text-5xl lg:text-6xl text-white">
            Huvudrätter & Favoriter
          </h2>
          <p className="text-white/50 text-[10px] min-[481px]:text-xs sm:text-sm mx-auto mt-3 uppercase tracking-[0.12em] whitespace-nowrap">
            Välj en kategori nedan för att utforska våra lyxiga rätter
          </p>
        </div>

        {/* Smooth Category Tabs Navigation Bar */}
        <div className="flex justify-center mb-12 w-full">
          <div ref={containerRef} className="relative inline-flex flex-nowrap justify-start md:justify-center items-center gap-1 sm:gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-full backdrop-blur-md max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl">
            {/* Sliding Gold Indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gold shadow-lg shadow-gold/25 transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.25,1)]"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />

            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current[tab.id] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${isActive
                      ? 'text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                    }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Items Grid - Staggered Premium Masonry (Desktop & Tablet) */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-x-6 lg:gap-x-10 items-start max-w-4xl mx-auto">
          {/* Left Column (Even index items) */}
          <div className="flex flex-col gap-8 lg:gap-12">
            {leftColumnItems.map((item, idx) => (
              <PremiumMenuCard
                key={item._id}
                item={item}
                index={idx * 2}
                quantityInCart={Number(quantitiesByItemId[item._id]) || 0}
                onAdd={addToCart}
                isOpen={isOpen}
                direction="left"
              />
            ))}
          </div>

          {/* Right Column (Odd index items - Staggered downwards) */}
          <div className="flex flex-col gap-8 lg:gap-12 sm:mt-16">
            {rightColumnItems.map((item, idx) => (
              <PremiumMenuCard
                key={item._id}
                item={item}
                index={idx * 2 + 1}
                quantityInCart={Number(quantitiesByItemId[item._id]) || 0}
                onAdd={addToCart}
                isOpen={isOpen}
                direction="right"
              />
            ))}
          </div>
        </div>

        {/* Featured Items Grid - Mobile Linear List */}
        <div className="flex flex-col gap-12 sm:hidden">
          {filteredItems.map((item, idx) => (
            <PremiumMenuCard
              key={item._id}
              item={item}
              index={idx}
              quantityInCart={Number(quantitiesByItemId[item._id]) || 0}
              onAdd={addToCart}
              isOpen={isOpen}
              direction={idx % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>

        {/* Bottom Callout link to full menu */}
        <div className="text-center mt-16">
          <Link
            to="/menu"
            className="inline-flex items-center gap-3 border border-gold/30 bg-gold/5 px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded-full w-fit mx-auto"
          >
            Visa Hela Menyn <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. Chef's Testimonial Section */}
      <section className="reveal relative py-24 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,164,77,0.04),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold/20 bg-gold/5 mb-8">
            <Quote size={28} className="text-gold opacity-80" />
          </div>

          <blockquote className="font-display text-2xl sm:text-3xl md:text-[34px] leading-relaxed text-white/90 italic font-light mb-8 max-w-3xl mx-auto">
            "Gastronomi är inte bara mat; det är en konstnärlig resa genom ett kosmos av smaker. På Venus strävar vi efter att varje tugga ska vara en brutal uppenbarelse av textur och passion."
          </blockquote>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[12px] uppercase tracking-[0.35em] font-bold text-gold">
              Chef de Cuisine, Marcus Aurelius
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Kreativ Ledare & Grundare, Venus Örebro
            </span>
          </div>
        </div>
      </section>

      {/* 4. Reservations Section at the bottom */}
      <div className="reveal">
        <ReservationSection />
      </div>
    </main>
  );
};

export default Home;

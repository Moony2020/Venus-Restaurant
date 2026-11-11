import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, X, Search, Minus, Plus, Trash2 } from 'lucide-react';
import { io as createSocket } from 'socket.io-client';
import SiteHeader from '../layout/SiteHeader';
import CategoryTabs from '../components/menu/CategoryTabs';
import MenuGrid from '../components/menu/MenuGrid';
import CartSidebar from '../components/menu/CartSidebar';
import OpeningHoursDropdown from '../components/menu/OpeningHoursDropdown';
import ItemModal from '../components/menu/ItemModal';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../hooks/useMenuData';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';
import { MENU_CATEGORIES, MENU_ITEMS, MENU_TAG_FILTERS } from '../lib/menuCatalog';

const ORDER_PREFS_KEY = 'venus_order_prefs';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.PROD ? undefined : 'http://localhost:5000');

const LEGACY_CATEGORY_MAP = {
  appetizer: 'starters',
  main: 'popular',
  dessert: 'desserts',
  drink: 'drinks',
  'pizza-class-1': 'pizza1',
  'pizza-class-2': 'pizza2',
  'pizza-class-3': 'pizza3',
  'pizza-class-4': 'pizza4',
  'special-pizzas': 'special',
  oxfilepizzor: 'oxfile',
  kebabratter: 'kebab',
  'a-la-carte': 'alacarte',
  sallader: 'salads',
  saser: 'sauces'
};

const normalizeKey = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CATEGORY_ID_BY_NORMALIZED_KEY = (() => {
  const map = new Map();
  MENU_CATEGORIES.forEach((c) => {
    map.set(normalizeKey(c.id), c.id);
    map.set(normalizeKey(c.label), c.id);
  });

  Object.entries(LEGACY_CATEGORY_MAP).forEach(([legacy, mapped]) => {
    map.set(normalizeKey(legacy), mapped);
  });

  return map;
})();

const resolveCategoryId = (rawCategory) => {
  const byLegacy = LEGACY_CATEGORY_MAP[rawCategory];
  if (byLegacy) return byLegacy;

  const normalized = normalizeKey(rawCategory);
  return CATEGORY_ID_BY_NORMALIZED_KEY.get(normalized) || 'popular';
};

const normalizeItem = (item) => {
  let resolvedCat = resolveCategoryId(item.category);
  const lowerName = (item.name || '').toLowerCase();
  
  if (resolvedCat === 'others' || resolvedCat === 'ovrigt') {
    if (
      lowerName.includes('pommes') ||
      lowerName.includes('frites') ||
      lowerName.includes('nuggets') ||
      lowerName.includes('lökringar') ||
      lowerName.includes('lokringar') ||
      lowerName.includes('mozzarella')
    ) {
      resolvedCat = 'starters';
    }
  }
  
  return {
    _id: String(item._id || item.id || ''),
    category: resolvedCat,
    name: item.name || '',
    description: item.description || '',
    price: Number(item.price) || 0,
    image: item.image || '/images/menu-pizza.webp',
    tags: Array.isArray(item.tags) ? item.tags : [],
    available: item.available !== false,
    customizations: item.customizations || []
  };
};

const isMenuDatasetUsable = (items, categoryIds) => {
  if (!items.length) return false;
  const present = new Set(items.map((i) => i.category));
  const hasPopular = items.some(
    (i) => i.category === 'popular' || (Array.isArray(i.tags) && i.tags.includes('popular'))
  );
  const covered = categoryIds.filter((id) => present.has(id)).length;
  return hasPopular && covered >= Math.max(8, Math.floor(categoryIds.length * 0.55));
};

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category') || '';
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeTag, setActiveTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);
  const [liveMenuItems, setLiveMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState('');
  const [orderMode, setOrderMode] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDER_PREFS_KEY);
      if (!raw) return 'pickup';
      const parsed = JSON.parse(raw);
      return parsed?.orderMode === 'delivery' ? 'delivery' : 'pickup';
    } catch {
      return 'pickup';
    }
  });

  const deliveryAvailable = false;
  const deliveryFee = 39;
  const pickupEtaText = '10-15 min';
  const deliveryEtaText = '25-40 min';

  const { items: apiItems, loading, error } = useMenuData();
  const { data: restaurantStatus } = useRestaurantStatus();
  const { items: cartItems, total, count, addToCart, lastAddedId, updateQuantity, removeFromCart, removeExtra, clearCart, openCartDrawer } = useCart();

  const normalizedApiItems = useMemo(() => (apiItems || []).map(normalizeItem), [apiItems]);

  useEffect(() => {
    setLiveMenuItems(normalizedApiItems);
  }, [normalizedApiItems]);

  useEffect(() => {
    const socket = createSocket(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true
    });

    socket.on('menu:updated', (items) => {
      setLiveMenuItems((items || []).map(normalizeItem));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const catalogItems = useMemo(() => MENU_ITEMS, []);
  const catalogCategoryIds = useMemo(() => MENU_CATEGORIES.map((c) => c.id), []);
  const mergedApiWithCatalog = useMemo(() => {
    const apiById = new Map(normalizedApiItems.map((item) => [item._id, item]));
    const merged = [...normalizedApiItems];

    for (const rawFallback of catalogItems) {
      const fallbackItem = normalizeItem(rawFallback);
      if (!apiById.has(fallbackItem._id)) {
        merged.push(fallbackItem);
      }
    }

    return merged;
  }, [normalizedApiItems, catalogItems]);

  const effectiveItems = useMemo(() => {
    if (isMenuDatasetUsable(liveMenuItems, catalogCategoryIds)) return liveMenuItems;
    if (isMenuDatasetUsable(mergedApiWithCatalog, catalogCategoryIds)) return mergedApiWithCatalog;
    return catalogItems;
  }, [liveMenuItems, mergedApiWithCatalog, catalogItems, catalogCategoryIds]);

  const categories = useMemo(() => {
    const fromCatalog = MENU_CATEGORIES.map((c) => c.id);
    const fromItems = [...new Set(effectiveItems.map((item) => item.category))];
    const combined = [...new Set([...fromCatalog, ...fromItems])];
    return MENU_CATEGORIES.filter((c) => combined.includes(c.id)).map((category) => {
      const count = effectiveItems.filter((item) => {
        if (category.id === 'popular') {
          return item.category === 'popular' || (Array.isArray(item.tags) && item.tags.includes('popular'));
        }
        return item.category === category.id;
      }).length;
      return { ...category, count };
    });
  }, [effectiveItems]);

  useEffect(() => {
    const validIds = new Set(categories.map((c) => c.id));
    const next =
      requestedCategory && validIds.has(requestedCategory)
        ? requestedCategory
        : validIds.has(activeCategory)
          ? activeCategory
          : categories[0]?.id || 'popular';
    setActiveCategory(next);
  }, [requestedCategory, categories, activeCategory]);

  useEffect(() => {
    setIsCategoryTransitioning(true);
    const t = setTimeout(() => setIsCategoryTransitioning(false), 300);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const results = effectiveItems.filter((item) => {
      const shouldUseCategoryFilter = term.length === 0;
      if (shouldUseCategoryFilter) {
        const inActiveCategory =
          item.category === activeCategory ||
          (activeCategory === 'popular' && Array.isArray(item.tags) && item.tags.includes('popular'));
        if (!inActiveCategory) return false;
      }
      if (activeTag !== 'all' && !(item.tags || []).includes(activeTag)) return false;
      if (!term) return true;
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      return haystack.includes(term);
    });

    // Deduplicate by name when searching (items can exist in both Populärt and their real category)
    if (term.length > 0) {
      const seen = new Map();
      for (const item of results) {
        const key = item.name.toLowerCase();
        // Prefer the item from its real category over the "popular" copy
        if (!seen.has(key) || seen.get(key).category === 'popular') {
          seen.set(key, item);
        }
      }
      return [...seen.values()];
    }

    return results;
  }, [effectiveItems, activeCategory, activeTag, searchTerm]);

  const globalSearchMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];
    const matches = effectiveItems.filter((item) => {
      if (activeTag !== 'all' && !(item.tags || []).includes(activeTag)) return false;
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      return haystack.includes(term);
    });

    // Deduplicate — prefer the item from its real category over the "popular" copy
    const seen = new Map();
    for (const item of matches) {
      const key = item.name.toLowerCase();
      if (!seen.has(key) || seen.get(key).category === 'popular') {
        seen.set(key, item);
      }
    }
    return [...seen.values()];
  }, [effectiveItems, activeTag, searchTerm]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2 || globalSearchMatches.length === 0) {
      setHighlightedItemId('');
      return;
    }

    const firstMatch = globalSearchMatches[0];
    const targetCategory = firstMatch.category;
    const categoryExists = categories.some((c) => c.id === targetCategory);

    if (categoryExists && activeCategory !== targetCategory) {
      setActiveCategory(targetCategory);
      setSearchParams({ category: targetCategory });
    }

    setHighlightedItemId(firstMatch._id);
    // Wait a tick for category transition/layout to settle, then scroll precisely.
    setTimeout(() => {
      const card = document.querySelector(`[data-menu-item-id="${firstMatch._id}"]`);
      if (!card) return;

      const header = document.querySelector('header');
      const stickyTabs = document.querySelector('[data-category-tabs]');
      const stickyOffset =
        (header?.getBoundingClientRect().height || 0) +
        (stickyTabs?.getBoundingClientRect().height || 0) +
        20;

      const cardTop = card.getBoundingClientRect().top + window.scrollY;
      const targetY = Math.max(0, cardTop - stickyOffset);

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }, 320);

    const timer = setTimeout(() => setHighlightedItemId(''), 1500);
    return () => clearTimeout(timer);
  }, [searchTerm, globalSearchMatches, categories, activeCategory, setSearchParams]);

  const onCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchParams({ category: categoryId });

    // Scroll to the top of the menu section adjusted for sticky header & tabs
    setTimeout(() => {
      const header = document.querySelector('header');
      const stickyTabs = document.querySelector('[data-category-tabs]');
      const stickyOffset =
        (header?.getBoundingClientRect().height || 0) +
        (stickyTabs?.getBoundingClientRect().height || 0);

      const section = document.querySelector('section');
      if (section) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const targetY = Math.max(0, sectionTop - stickyOffset - 16); // 16px extra padding for aesthetics

        // Only scroll if the user has scrolled past this point
        if (window.scrollY > targetY) {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  const activeCategoryLabel = useMemo(() => categories.find((c) => c.id === activeCategory)?.label || '', [categories, activeCategory]);

  useEffect(() => {
    if (!deliveryAvailable && orderMode === 'delivery') {
      setOrderMode('pickup');
    }
  }, [deliveryAvailable, orderMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        ORDER_PREFS_KEY,
        JSON.stringify({ orderMode, deliveryFee, pickupEtaText, deliveryEtaText })
      );
    } catch {
      // Ignore storage failures
    }
  }, [orderMode]);

  const isOpen = restaurantStatus?.nowStatus?.isOpen ?? true;
  const statusText = restaurantStatus?.nowStatus?.text || '';

  const finalTotal = useMemo(
    () => Math.round(total) + (orderMode === 'delivery' ? deliveryFee : 0),
    [total, orderMode]
  );

  const quantitiesByItemId = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const baseId = String(item._id || item.id || '');
      if (!baseId) return acc;
      acc[baseId] = (acc[baseId] || 0) + (Number(item.quantity) || 0);
      return acc;
    }, {});
  }, [cartItems]);

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      {/* Menu Hero Section with Floating Opening Hours */}
      <div className="relative">
        {restaurantStatus?.week && (
          <div className="absolute top-3 right-3 sm:right-6 sm:top-5 lg:right-8 lg:top-6 z-40 pointer-events-auto">
            <OpeningHoursDropdown 
              week={restaurantStatus.week} 
              statusText={statusText}
              isOpen={isOpen}
              isRollover={restaurantStatus?.nowStatus?.isRollover}
            />
          </div>
        )}

        <section className="relative overflow-hidden border-b border-white/10 bg-[#070b10] min-h-[260px] sm:min-h-[300px] md:min-h-[340px] lg:min-h-[380px] flex items-center">
        {/* Background Image: Steak dish centered on mobile, right-aligned on desktop */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/menu-hero.webp"
            alt="Venus Gastronomisk Meny"
            className="w-full h-full object-cover object-[52%_center] md:object-[78%_center] opacity-65 md:opacity-80"
          />
          {/* Subtle mobile scrim + desktop horizontal gradient */}
          <div className="absolute inset-0 bg-[#070b10]/60 md:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b10] via-[#070b10]/60 to-[#070b10]/40 md:bg-gradient-to-r md:from-[#070b10] md:via-[#070b10]/90 md:to-transparent md:w-[72%] lg:w-[60%]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#070b10] to-transparent" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070b10]/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[2200px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          <div className="max-w-xl lg:max-w-2xl text-left space-y-2.5 sm:space-y-3.5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-3 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span>KULINARISK KONST • ÖREBRO</span>
            </div>

            {/* Main Title: 2 lines */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-light text-white leading-tight tracking-wide">
              Vår Filosofi &amp; <br />
              <span className="italic text-gold font-normal">Gastronomiska Meny</span>
            </h1>

            {/* Description */}
            <p className="text-white/70 text-xs sm:text-sm md:text-[14px] font-light leading-relaxed max-w-lg">
              En intim symfoni mellan vedugnens hetta, noggrant utvalda råvaror från nordiska gårdar och ett kompromisslöst italienskt hantverk.
            </p>
          </div>
        </div>
      </section>
      </div>

      <CategoryTabs categories={categories} activeCategory={activeCategory} onChange={onCategoryChange} />

      <section id="menu-items-section" className="mx-auto grid w-full max-w-[2200px] gap-4 px-3 py-5 pb-16 min-[1200px]:grid-cols-[1fr_320px] xl:gap-6 lg:px-8 xl:pb-24">
        <div>
          <div className="mb-4">
            <div className="pb-2 sm:pb-2.5">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white">
                {activeCategoryLabel}
              </h2>
              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-white/50">
                {activeCategory === 'popular'
                  ? 'Gästernas mest älskade kreationer och husets specialiteter.'
                  : `Noggrant tillagade rätter i kategorin ${activeCategoryLabel.toLowerCase()}.`}
              </p>
            </div>

            {/* Desktop: one row — search + filters side by side */}
            {/* Mobile: search full-width, filters wrap below */}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
              {/* Search bar — full width on mobile, fixed min-width on desktop */}
              <div className="relative w-full md:flex-1 md:min-w-[260px] md:max-w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} strokeWidth={2.5} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Sök i menyn..."
                  className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-3.5 pl-11 pr-10 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filters — wrap below search on mobile, inline on desktop */}
              <div className="flex flex-wrap gap-2">
                {MENU_TAG_FILTERS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag(tag.id)}
                    className={`rounded-lg border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 ${
                      activeTag === tag.id
                        ? 'border-gold bg-gold text-black shadow-lg shadow-gold/20'
                        : 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 border border-yellow-500/30 bg-yellow-900/15 p-3 text-sm text-yellow-200">
              {error}
            </div>
          )}

          <div
            className={`origin-top transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] ${
              isCategoryTransitioning ? 'translate-y-1 opacity-85' : 'translate-y-0 opacity-100'
            }`}
          >
            <MenuGrid
              items={filteredItems}
              loading={loading && normalizedApiItems.length === 0 && liveMenuItems.length === 0}
              onAdd={isOpen ? setSelectedItem : () => {}}
              lastAddedId={lastAddedId}
              quantitiesByItemId={quantitiesByItemId}
              restaurantOpen={isOpen}
              highlightedItemId={highlightedItemId}
            />
          </div>
        </div>

        <CartSidebar
          items={cartItems}
          total={Math.round(total)}
          count={count}
          orderMode={orderMode}
          onOrderModeChange={setOrderMode}
          deliveryAvailable={deliveryAvailable}
          deliveryFee={deliveryFee}
          pickupEtaText={pickupEtaText}
          deliveryEtaText={deliveryEtaText}
          restaurantOpen={isOpen}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          restaurantStatus={restaurantStatus}
        />
      </section>

      {/* Floating Mobile/Tablet Cart Button - Always visible on screens < 1200px */}
      <button
        type="button"
        onClick={openCartDrawer}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black shadow-2xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all min-[1200px]:hidden"
        aria-label="Öppna varukorg"
      >
        <div className="relative">
          <ShoppingBag size={18} strokeWidth={2} />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-extrabold text-gold ring-1 ring-gold/40">
              {count}
            </span>
          )}
        </div>
        <span>{count > 0 ? `${finalTotal} kr` : 'Varukorg'}</span>
      </button>

      <ItemModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAdd={addToCart} 
      />
    </main>
  );
};

export default Menu;

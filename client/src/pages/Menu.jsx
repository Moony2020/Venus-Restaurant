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
    image: item.image || '/images/menu-pizza.png',
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
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
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
  const { items: cartItems, total, count, addToCart, lastAddedId, updateQuantity, removeFromCart, removeExtra } = useCart();

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

      <CategoryTabs categories={categories} activeCategory={activeCategory} onChange={onCategoryChange} />

      <section className="mx-auto grid w-full max-w-[2200px] gap-4 px-3 py-5 pb-16 min-[1200px]:grid-cols-[1fr_320px] xl:gap-6 lg:px-8 xl:pb-24">
        <div>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-center sm:justify-end text-xs">
              {restaurantStatus?.week && (
                <OpeningHoursDropdown 
                  week={restaurantStatus.week} 
                  statusText={statusText}
                  isOpen={isOpen}
                  isRollover={restaurantStatus?.nowStatus?.isRollover}
                />
              )}
            </div>

            <h2 className="mb-3 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-5xl">
              {activeCategoryLabel}
            </h2>

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
        />
      </section>

      {count > 0 && (
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black shadow-2xl shadow-gold/20 min-[1200px]:hidden"
        >
          <ShoppingBag size={18} />
          {count} • {finalTotal} kr
        </button>
      )}

      <div
        className={`fixed inset-0 z-[200] bg-black/60 transition-opacity min-[1200px]:hidden ${
          isMobileCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileCartOpen(false)}
      />

      <ItemModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAdd={addToCart} 
      />

      <aside
        className={`fixed bottom-0 right-0 top-0 z-[201] w-[85%] max-w-sm border-l border-white/10 bg-[#0a0f14] p-6 shadow-2xl transition-transform min-[1200px]:hidden ${
          isMobileCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <h2 className="font-display text-3xl">Din varukorg</h2>
          <button onClick={() => setIsMobileCartOpen(false)} className="text-white/50 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="mt-5 border border-white/10 bg-white/[0.04] p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => deliveryAvailable && setOrderMode('delivery')}
              disabled={!deliveryAvailable}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition ${
                orderMode === 'delivery'
                  ? 'border-gold bg-gold text-black'
                  : deliveryAvailable
                    ? 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
                    : 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35'
              }`}
            >
              Leverans
            </button>
            <button
              type="button"
              onClick={() => setOrderMode('pickup')}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition ${
                orderMode === 'pickup'
                  ? 'border-gold bg-gold text-black'
                  : 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
              }`}
            >
              Hämta själv
            </button>
          </div>
          <div className="mt-3">
            {!deliveryAvailable && orderMode === 'delivery' ? (
              <p className="text-white/55">Ej tillgänglig</p>
            ) : (
              <>
                <p className="text-sm text-white/60">{orderMode === 'pickup' ? 'Upphämtningstid' : 'Leveranstid'}</p>
                <p className="text-base font-semibold text-white/90">
                  {orderMode === 'delivery' ? deliveryEtaText : pickupEtaText}
                </p>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-white/65">
            <span>Leveransavgift</span>
            <span>{orderMode === 'delivery' ? `${deliveryFee} kr` : '0 kr'}</span>
          </div>
        </div>

        <div className="mt-6 max-h-[44vh] space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-20 text-center">
              <ShoppingBag size={48} className="mb-3" strokeWidth={1} />
              <p className="text-sm italic">Din varukorg är tom</p>
            </div>
          ) : (
            cartItems.map((item, i) => (
              <div key={`${item.id}-${i}`} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img 
                      src={item.image || '/images/menu-pizza.png'} 
                      alt={item.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-medium text-white/95 leading-tight">{item.name}</p>
                        <p className="text-[14px] font-bold text-gold">{Math.round(item.price * item.quantity)} kr</p>
                      </div>
                      
                      {/* Extras List */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          {item.extras.map((extra, idx) => (
                            <div key={`${extra.optionId}-${idx}`} className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <button 
                                  onClick={() => removeExtra(item.id, extra.groupId, extra.optionId)}
                                  className="flex h-4 w-4 items-center justify-center rounded-sm border border-white/10 bg-white/[0.05] text-white/40 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all shadow-sm"
                                >
                                  <X size={8} strokeWidth={3} />
                                </button>
                                <span className="text-[10px] text-gold/70 font-medium italic leading-none tracking-tight">{extra.label}</span>
                              </div>
                              <span className="text-[10px] text-gold/60 font-bold leading-none tracking-tighter">+ {extra.price} kr</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-white/40"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[20px] text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-white/40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Ta bort ${item.name}`}
                        title="Ta bort"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/35 transition-colors hover:border-red-400/40 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          {!isOpen && <p className="mb-2 text-xs text-red-300">Restaurangen är stängd just nu</p>}
          <p className="flex items-center justify-between text-xl">
            <span>Totalt</span>
            <span className="text-gold">{finalTotal} kr</span>
          </p>
          {count > 0 && isOpen ? (
            <Link
              to="/cart"
              onClick={() => setIsMobileCartOpen(false)}
              className="mt-3 block w-full border border-gold bg-gold px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-black transition hover:bg-[#d4b56a]"
            >
              Förhandsgranska beställning
            </Link>
          ) : (
            <span className="mt-3 block w-full cursor-not-allowed border border-white/20 bg-white/10 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-white/40">
              Förhandsgranska beställning
            </span>
          )}
        </div>
      </aside>
    </main>
  );
};

export default Menu;

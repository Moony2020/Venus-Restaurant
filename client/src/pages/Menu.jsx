import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { io as createSocket } from 'socket.io-client';
import SiteHeader from '../layout/SiteHeader';
import CategoryTabs from '../components/menu/CategoryTabs';
import MenuGrid from '../components/menu/MenuGrid';
import CartSidebar from '../components/menu/CartSidebar';
import OpeningHoursDropdown from '../components/menu/OpeningHoursDropdown';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../hooks/useMenuData';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';
import { MENU_CATEGORIES, MENU_ITEMS, MENU_TAG_FILTERS } from '../lib/menuCatalog';

const ORDER_PREFS_KEY = 'venus_order_prefs';
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

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

const normalizeApiItem = (item) => ({
  _id: item._id || item.id,
  category: LEGACY_CATEGORY_MAP[item.category] || item.category || 'popular',
  name: item.name || '',
  description: item.description || '',
  price: Number(item.price) || 0,
  image: item.image || '/images/menu-pizza.png',
  tags: Array.isArray(item.tags) ? item.tags : [],
  available: item.available !== false
});

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
  const { items: cartItems, total, count, addToCart, lastAddedId } = useCart();

  const normalizedApiItems = useMemo(() => (apiItems || []).map(normalizeApiItem), [apiItems]);

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
      setLiveMenuItems((items || []).map(normalizeApiItem));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const catalogItems = useMemo(() => MENU_ITEMS, []);
  const catalogCategoryIds = useMemo(() => MENU_CATEGORIES.map((c) => c.id), []);
  const effectiveItems = useMemo(() => {
    if (isMenuDatasetUsable(liveMenuItems, catalogCategoryIds)) return liveMenuItems;
    if (isMenuDatasetUsable(normalizedApiItems, catalogCategoryIds)) return normalizedApiItems;
    return catalogItems;
  }, [liveMenuItems, normalizedApiItems, catalogItems, catalogCategoryIds]);

  const categories = useMemo(() => {
    const fromCatalog = MENU_CATEGORIES.map((c) => c.id);
    const fromItems = [...new Set(effectiveItems.map((item) => item.category))];
    const combined = [...new Set([...fromCatalog, ...fromItems])];
    return MENU_CATEGORIES.filter((c) => combined.includes(c.id));
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
    return effectiveItems.filter((item) => {
      const inActiveCategory =
        item.category === activeCategory ||
        (activeCategory === 'popular' && Array.isArray(item.tags) && item.tags.includes('popular'));
      if (!inActiveCategory) return false;
      if (activeTag !== 'all' && !(item.tags || []).includes(activeTag)) return false;
      if (!term) return true;
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [effectiveItems, activeCategory, activeTag, searchTerm]);

  const onCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchParams({ category: categoryId });
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

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      <CategoryTabs categories={categories} activeCategory={activeCategory} onChange={onCategoryChange} />

      <section className="mx-auto grid w-[98vw] max-w-[2200px] gap-4 px-3 py-5 pb-16 min-[1200px]:grid-cols-[1fr_320px] xl:gap-6 lg:px-8 xl:pb-24">
        <div>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-end text-xs">
              {restaurantStatus?.week && (
                <OpeningHoursDropdown 
                  week={restaurantStatus.week} 
                  statusText={statusText}
                  isOpen={isOpen}
                />
              )}
            </div>

            <h2 className="mb-3 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-5xl">
              {activeCategoryLabel}
            </h2>

            <div className="flex flex-wrap gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sök i menyn"
                className="min-w-[220px] flex-1 border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/45 focus:border-gold focus:outline-none lg:min-w-[360px]"
              />
              {MENU_TAG_FILTERS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveTag(tag.id)}
                  className={`border px-4 py-3 text-[10px] uppercase tracking-[0.16em] transition ${
                    activeTag === tag.id
                      ? 'border-gold bg-gold text-black'
                      : 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
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
              onAdd={isOpen ? addToCart : () => {}}
              lastAddedId={lastAddedId}
              restaurantOpen={isOpen}
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

        <div className="mt-6 max-h-[44vh] space-y-4 overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-sm text-white/55">Din varukorg är tom.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <p className="text-sm">{item.name}</p>
                  <p className="text-xs text-white/50">
                    {item.quantity} x {item.price} kr
                  </p>
                </div>
                <p className="text-sm text-gold">{Math.round(item.subtotal)} kr</p>
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
              to="/checkout"
              onClick={() => setIsMobileCartOpen(false)}
              className="mt-3 block w-full border border-gold bg-gold px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-black transition hover:bg-goldSoft"
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

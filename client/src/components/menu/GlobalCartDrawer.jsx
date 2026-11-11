import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRestaurantStatus } from '../../hooks/useRestaurantStatus';
import CartSidebar from './CartSidebar';

const ORDER_PREFS_KEY = 'venus_order_prefs';

const GlobalCartDrawer = () => {
  const {
    items,
    total,
    count,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartDrawerOpen,
    closeCartDrawer
  } = useCart();

  const { data: restaurantStatus } = useRestaurantStatus();
  const isOpen = restaurantStatus?.nowStatus?.isOpen ?? true;

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
  const pickupEtaText = '10 - 15 minuter';
  const deliveryEtaText = '25 - 40 minuter';

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

  // Lock html and body scroll when drawer is open to prevent double scrollbars
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isCartDrawerOpen) {
      root.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      root.style.overscrollBehavior = 'none';
      body.style.overscrollBehavior = 'none';
    } else {
      root.style.overflow = '';
      body.style.overflow = '';
      root.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    }

    return () => {
      root.style.overflow = '';
      body.style.overflow = '';
      root.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    };
  }, [isCartDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isCartDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[251] w-[92%] max-w-[420px] border-l border-white/10 bg-[#070b10] p-4 sm:p-6 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto custom-scrollbar ${
          isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Din varukorg"
      >
        <CartSidebar
          isDrawer={true}
          onClose={closeCartDrawer}
          items={items}
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
      </aside>
    </>
  );
};

export default GlobalCartDrawer;


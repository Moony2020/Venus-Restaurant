import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'venus_cart_items';

const TOAST_STYLE = {
  style: {
    background: '#0a1018',
    color: '#f8f5ee',
    border: '1px solid rgba(200, 164, 77, 0.2)',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '0',
    padding: '12px 24px',
  },
  iconTheme: {
    primary: '#c8a44d',
    secondary: '#0a1018',
  },
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [lastAddedId, setLastAddedId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures (private mode / quota)
    }
  }, [items]);

  const addToCart = useCallback((item) => {
    // If the item comes with a cartItemId (e.g. from ItemModal with notes), use it.
    // Otherwise fallback to its normal ID.
    const cartItemId = item.cartItemId || item._id || item.id;
    if (!cartItemId) return;

    const qtyToAdd = item.quantityToAdd || 1;

    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === cartItemId);
      if (existing) {
        toast.success(`${item.name} uppdaterad`, TOAST_STYLE);
        return prev.map((entry) =>
          entry.id === cartItemId
            ? { ...entry, quantity: entry.quantity + qtyToAdd }
            : entry
        );
      }

      toast.success(`${item.name} tillagd`, TOAST_STYLE);
      return [
        ...prev,
        {
          id: cartItemId,
          _id: item._id || item.id, // Keep the original product ID reference
          name: item.name,
          price: Number(item.price) || 0,
          quantity: qtyToAdd,
          image: item.image || '',
          category: item.category || '',
          notes: item.notes || '',
          availabilityAction: item.availabilityAction || 'remove',
          extras: item.extras || [],
          basePrice: item.basePrice || Number(item.price) || 0
        }
      ];
    });

    setLastAddedId(item._id || item.id);
    setTimeout(() => setLastAddedId(null), 600);
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => {
      const item = prev.find(i => i.id === id || i._id === id);
      if (item) toast(`${item.name} borttagen`, TOAST_STYLE);
      return prev.filter((item) => item.id !== id && item._id !== id);
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    const safeQty = Math.max(0, Number(qty) || 0);

    setItems((prev) => {
      if (safeQty === 0) {
        return prev.filter((item) => item.id !== id && item._id !== id);
      }

      return prev.map((item) =>
        item.id === id || item._id === id
          ? { ...item, quantity: safeQty }
          : item
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemsWithSubtotal = useMemo(
    () => items.map((item) => ({ ...item, subtotal: item.price * item.quantity })),
    [items]
  );

  const subtotal = useMemo(
    () => itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0),
    [itemsWithSubtotal]
  );

  const total = useMemo(() => subtotal, [subtotal]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const removeExtra = useCallback((cartItemId, groupId, optionId) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id !== cartItemId) return item;

        // 1. Find the extra to remove
        const extraToRemove = item.extras?.find(e => e.groupId === groupId && e.optionId === optionId);
        if (!extraToRemove) return item;

        // 2. Filter the extras list
        const nextExtras = item.extras.filter(e => !(e.groupId === groupId && e.optionId === optionId));

        // 3. Update selectedOptions
        const nextSelected = { ...item.selectedOptions };
        if (Array.isArray(nextSelected[groupId])) {
          nextSelected[groupId] = nextSelected[groupId].filter(id => id !== optionId);
        } else if (nextSelected[groupId] === optionId) {
          delete nextSelected[groupId];
        }

        // 4. Update the price (subtract the extra's price)
        const nextPrice = Math.max(item.basePrice || 0, item.price - (extraToRemove.price || 0));

        return { 
          ...item, 
          extras: nextExtras,
          selectedOptions: nextSelected,
          price: nextPrice
        };
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      items: itemsWithSubtotal,
      addToCart,
      removeFromCart,
      removeExtra,
      updateQty,
      updateQuantity: updateQty,
      clearCart,
      subtotal,
      total,
      count,
      lastAddedId
    }),
    [itemsWithSubtotal, addToCart, removeFromCart, removeExtra, updateQty, clearCart, subtotal, total, count, lastAddedId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
};

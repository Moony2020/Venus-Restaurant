import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';
import { apiPost } from '../lib/api';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';

const field =
  'w-full border border-gold/25 bg-transparent px-4 py-4 text-base text-white placeholder:text-white/35 focus:border-gold focus:outline-none';
const ORDER_PREFS_KEY = 'venus_order_prefs';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { data: restaurantStatus } = useRestaurantStatus();
  const [contact, setContact] = useState({ customerName: '', email: '', phone: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDER_PREFS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const mode = parsed?.orderMode === 'delivery' ? 'delivery' : 'pickup';
      return {
        orderMode: mode,
        deliveryFee: mode === 'delivery' ? Number(parsed?.deliveryFee) || 39 : 0,
        pickupEtaText: parsed?.pickupEtaText || '10-15 min',
        deliveryEtaText: parsed?.deliveryEtaText || '25-40 min'
      };
    } catch {
      return { orderMode: 'pickup', deliveryFee: 0, pickupEtaText: '10-15 min', deliveryEtaText: '25-40 min' };
    }
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu', { replace: true });
    }
  }, [items.length, navigate]);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.subtotal ?? item.price * item.quantity
      })),
    [items]
  );

  const etaText = orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryEtaText : orderPrefs.pickupEtaText;
  const finalTotal = Math.round(total) + (orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0);
  const isOpen = restaurantStatus?.nowStatus?.isOpen ?? true;

  const onPlaceOrder = async () => {
    if (isSubmitting || normalizedItems.length === 0 || !isOpen) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const order = await apiPost('/orders', {
        customerName: contact.customerName,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes,
        totalAmount: finalTotal,
        orderMode: orderPrefs.orderMode,
        deliveryFee: orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0,
        etaText,
        items: normalizedItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      clearCart();
      navigate(`/confirmation?tracking=${order.trackingCode}`, {
        state: { order, success: true },
        replace: true
      });
    } catch (err) {
      setSubmitError(err?.message?.includes('403') ? 'Restaurangen är stängd just nu' : 'Något gick fel, försök igen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05090e] text-white">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-6 md:pt-10 lg:grid-cols-[1fr_420px] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-12">
        <div>
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.6em] text-gold sm:text-base">Gastronomic Voyage</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl">Kassan</h1>

          <h2 className="mt-10 flex items-center gap-5 font-display text-4xl sm:text-5xl xl:mt-14 xl:text-6xl">
            <span>1. Kontaktuppgifter</span>
            <span className="h-px flex-1 bg-gold/35" />
          </h2>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Namn</p>
              <input className={field} value={contact.customerName} onChange={(e) => setContact({ ...contact, customerName: e.target.value })} placeholder="Ditt fullständiga namn" />
            </div>
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">E-post</p>
              <input className={field} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="namn@exempel.se" />
            </div>
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Telefon</p>
              <input className={field} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="070 000 00 00" />
            </div>
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Önskemål</p>
              <input className={field} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} placeholder="Allergier eller speciella behov" />
            </div>
          </div>

          {!isOpen && (
            <p className="mt-6 border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
              Restaurangen är stängd just nu.
            </p>
          )}

          {submitError && (
            <p className="mt-6 border border-red-400/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={isSubmitting || normalizedItems.length === 0 || !isOpen}
            className="mt-10 w-full border border-gold px-6 py-5 text-xs uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-50 xl:mt-12"
          >
            {isSubmitting ? 'Processing...' : `Place Order - ${finalTotal} SEK`}
          </button>
        </div>

        <aside className="h-fit border-l border-gold/70 bg-white/[0.05] p-6 xl:p-10">
          <h2 className="whitespace-nowrap font-display text-3xl sm:text-4xl">Din Beställning</h2>
          <div className="mt-3 border border-white/10 bg-white/[0.04] p-3 text-sm">
            <p className="text-white/70">Sätt: <span className="text-white">{orderPrefs.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</span></p>
            <p className="text-white/70">Tid: <span className="text-white">{etaText}</span></p>
            <p className="text-white/70">Leveransavgift: <span className="text-white">{orderPrefs.orderMode === 'delivery' ? `${orderPrefs.deliveryFee} SEK` : '0 SEK'}</span></p>
          </div>
          <div className="mt-6 space-y-5 xl:mt-7">
            {normalizedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 object-cover xl:h-20 xl:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base sm:text-lg lg:text-xl">{item.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{item.quantity} x {item.price} SEK</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-gold sm:text-base lg:text-lg">{item.subtotal} SEK</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-lg">
            <p className="flex items-center justify-between">
              <span>Totalt</span>
              <span className="text-gold">{finalTotal} SEK</span>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;

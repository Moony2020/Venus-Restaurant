import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiGet, apiPost } from '../lib/api';
import { useCart } from '../context/CartContext';

const Confirmation = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const stateOrder = location.state?.order;
  const queryParams = new URLSearchParams(location.search);
  const isPaid = queryParams.get('paid') === '1';
  const stripeSessionId = queryParams.get('session_id');
  const paypalToken = queryParams.get('token'); // PayPal Order ID
  const success = Boolean(location.state?.success || stateOrder || isPaid || paypalToken);
  const trackingFromQuery = queryParams.get('tracking');

  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder && Boolean(trackingFromQuery));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [success, clearCart]);

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      if (!trackingFromQuery) return;
      
      try {
        // Confirm Stripe payment if returned from Stripe-hosted checkout
        if (stripeSessionId) {
          try {
            await apiGet(`/payments/stripe/confirm-session?session_id=${encodeURIComponent(stripeSessionId)}`);
          } catch (e) {
            console.error('Stripe session confirmation failed', e);
          }
        }

        // If we have a paypal token, capture it first
        if (paypalToken) {
          try {
            // First load order to get its internal ID
            const tempOrder = await apiGet(`/orders/${trackingFromQuery}`);
            if (tempOrder?._id) {
              await apiPost('/payments/paypal/capture-order', {
                orderId: tempOrder._id,
                paypalOrderId: paypalToken
              });
            }
          } catch (e) {
            console.error('PayPal capture failed', e);
          }
        }

        if (stateOrder && !paypalToken) {
          if (active) setOrder(stateOrder);
          if (active) setLoading(false);
          return;
        }

        const data = await apiGet(`/orders/${trackingFromQuery}`);
        if (active) setOrder(data);
      } catch {
        if (active) setLoadError('Something went wrong, try again');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [trackingFromQuery, stateOrder, paypalToken, stripeSessionId]);

  const mappedItems = useMemo(
    () =>
      (order?.items || []).map((item) => {
        const extras = item.extras || [];
        const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
        const basePrice = (item.price || 0) - extrasTotal;
        return {
          id: item.menuItemId || item.id || item._id || item.name,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          basePrice: Math.max(0, basePrice),
          extras,
          subtotal: (item.price || 0) * (item.quantity || 0)
        };
      }),
    [order]
  );

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Order confirmation</p>
        <h1 className="mt-2 font-display text-6xl">Tack för din beställning</h1>

        <p className={`mt-6 border px-4 py-3 text-sm ${success && !loadError ? 'border-green-400/30 bg-green-900/20 text-green-200' : 'border-red-400/30 bg-red-900/20 text-red-200'}`}>
          {success && !loadError ? 'Order placed successfully' : (loadError || 'Something went wrong, try again')}
        </p>

        <div className="mt-8 border border-white/15 bg-white/[0.03] p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Order number</p>
              <p className="mt-2 text-2xl text-gold">{order?.trackingCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Estimated time</p>
              <p className="mt-2 text-2xl">{order?.etaText || '20-30 min'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Total</p>
              <p className="mt-2 text-2xl">{Math.round(order?.totalAmount || 0)} SEK</p>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/70">
            <p>
              Sätt: <span className="text-white">{order?.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</span>
            </p>
            <p>
              Leveransavgift: <span className="text-white">{order?.deliveryFee ? `${Math.round(order.deliveryFee)} SEK` : '0 SEK'}</span>
            </p>
          </div>

          <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
            {loading ? (
              <p className="text-sm text-white/60">Loading order...</p>
            ) : mappedItems.length === 0 ? (
              <p className="text-sm text-white/60">No order items found.</p>
            ) : (
              mappedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="text-white">{item.name}</p>
                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-1 space-y-0.5 mb-1.5">
                        {item.extras.map((extra, idx) => (
                          <p key={`${extra.optionId}-${idx}`} className="text-[10px] text-gold/70 italic leading-tight">
                            • {extra.label} <span className="text-gold/50 ml-1">(+{extra.price} kr)</span>
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-white/50 text-[11px]">{item.quantity} × {item.basePrice} SEK</p>
                  </div>
                  <p className="text-gold">{item.subtotal} SEK</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {order?.trackingCode && (
            <Link to={`/track/${order.trackingCode}`} className="inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black">
              Track Your Order
            </Link>
          )}
          <Link to="/menu" className="inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black">
            Back to Menu
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Confirmation;

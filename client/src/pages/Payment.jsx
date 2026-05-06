import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';
import { apiPost } from '../lib/api';

const field =
  'w-full border border-gold/25 bg-transparent px-4 py-4 text-base text-white placeholder:text-white/35 focus:border-gold focus:outline-none';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clearCart } = useCart();
  const contact = location.state?.contact || {};
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('card');

  const handlePay = async () => {
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/order-confirmation`;
      const cancelUrl = `${window.location.origin}/payment`;

      if (method === 'card') {
        const stripeSession = await apiPost('/payments/stripe/checkout-session', {
          items,
          successUrl,
          cancelUrl,
          customerEmail: contact.email
        });
        if (stripeSession?.url) {
          window.location.href = stripeSession.url;
          return;
        }
      }

      if (method === 'paypal') {
        const paypalOrder = await apiPost('/payments/paypal/create-order', {
          items,
          returnUrl: successUrl,
          cancelUrl
        });
        if (paypalOrder?.approveUrl) {
          window.location.href = paypalOrder.approveUrl;
          return;
        }
      }

      const order = await apiPost('/orders', {
        customerName: contact.customerName || 'Guest',
        email: contact.email || 'guest@example.com',
        items: items.map((item) => ({ menuItemId: item._id, name: item.name, price: item.price, quantity: item.quantity })),
        totalAmount: total + 200
      });
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05090e] text-white">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-6 md:pt-10 lg:grid-cols-[1fr_420px] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Gastronomic Voyage</p>
          <h1 className="mt-2 font-display text-6xl sm:text-7xl xl:text-8xl">Kassan</h1>

          <h2 className="mt-10 flex items-center gap-5 font-display text-4xl sm:text-5xl xl:mt-14 xl:text-6xl">
            <span>2. Betalningsmetod</span>
            <span className="h-px flex-1 bg-gold/35" />
          </h2>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:mt-8">
            <button onClick={() => setMethod('card')} className={`border px-5 py-6 text-left ${method === 'card' ? 'border-gold bg-white/[0.07]' : 'border-gold/25'}`}>
              <p className="text-xl sm:text-2xl">Kreditkort</p>
              <p className="text-sm text-white/65">Stripe Checkout</p>
            </button>
            <button onClick={() => setMethod('paypal')} className={`border px-5 py-6 text-left ${method === 'paypal' ? 'border-gold bg-white/[0.07]' : 'border-gold/25'}`}>
              <p className="text-xl sm:text-2xl">PayPal</p>
              <p className="text-sm text-white/65">Secure redirect</p>
            </button>
          </div>

          <div className="mt-6 border border-gold/25 bg-white/[0.03] p-5 xl:mt-7 xl:p-6">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Kortnummer</p>
            <input className={field} placeholder="0000 0000 0000 0000" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Utgångsdatum</p><input className={field} placeholder="MM/YY" /></div>
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">CVV</p><input className={field} placeholder="123" /></div>
            </div>
          </div>

          <button onClick={handlePay} disabled={loading || !items.length} className="mt-10 w-full border border-gold px-6 py-5 text-xs uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-black disabled:opacity-50 xl:mt-14">
            {loading ? 'Betalar...' : `Betala nu - ${Math.round(total + 200)} SEK`}
          </button>
        </div>

        <aside className="h-fit border-l border-gold/70 bg-white/[0.05] p-6 xl:p-8">
          <h2 className="font-display text-5xl xl:text-6xl">Din Beställning</h2>
          <div className="mt-6 space-y-5 xl:mt-7">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 object-cover xl:h-20 xl:w-20" />
                <div className="flex-1">
                  <p className="font-display text-2xl xl:text-3xl">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">{item.quantity} x {item.price} SEK</p>
                </div>
                <p className="text-xl text-gold xl:text-2xl">{item.quantity * item.price} SEK</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Payment;


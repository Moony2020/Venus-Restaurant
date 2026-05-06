import { Link, useLocation } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';

const OrderConfirmation = () => {
  const order = useLocation().state?.order;

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.26em] text-gold">Order confirmed</p>
        <h1 className="mt-3 font-display text-6xl">Tack för din beställning</h1>
        <p className="mt-6 text-white/75">Trackingkod: <span className="text-gold">{order?.trackingCode || 'N/A'}</span></p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/order-tracking" className="border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold">Spåra order</Link>
          <Link to="/menu" className="border border-white/30 px-6 py-3 text-xs uppercase tracking-[0.2em]">Till meny</Link>
        </div>
      </section>
    </main>
  );
};

export default OrderConfirmation;
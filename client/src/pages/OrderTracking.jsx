import { useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { apiGet } from '../lib/api';

const OrderTracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const lookup = async () => {
    setError('');
    try {
      const data = await apiGet(`/orders/${trackingCode}`);
      setOrder(data);
    } catch {
      setError('Order hittades inte');
      setOrder(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-8 py-24 sm:py-32">
        <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-4">Leverans & Status</p>
        <h1 className="font-display text-4xl sm:text-6xl text-white">Spåra Din Order</h1>
        <div className="mt-6 flex gap-3">
          <input 
            value={trackingCode} 
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())} 
            placeholder="Trackingkod" 
            className="flex-1 border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-gold/50 transition-colors" 
          />
          <button 
            onClick={lookup} 
            className="border border-gold px-8 py-3 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black transition-all"
          >
            SÖK
          </button>
        </div>
        
        {error && <p className="mt-4 text-red-400 text-sm italic">{error}</p>}
        
        {order && (
          <div className="mt-12 border border-gold/20 bg-panel/30 p-8">
            <h2 className="font-display text-2xl mb-6 text-gold">Orderdetaljer</h2>
            <div className="space-y-4 text-sm text-white/80">
              <p className="flex justify-between">
                <span>Status:</span>
                <span className="text-gold font-bold uppercase tracking-widest">{order.status}</span>
              </p>
              <p className="flex justify-between">
                <span>Total belopp:</span>
                <span className="text-white font-medium">{Math.round(order.totalAmount)} KR</span>
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default OrderTracking;

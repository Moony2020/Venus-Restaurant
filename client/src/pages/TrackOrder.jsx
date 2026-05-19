import { useEffect, useMemo, useState } from 'react';
import { io as createSocket } from 'socket.io-client';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiGet } from '../lib/api';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.PROD ? undefined : 'http://localhost:5000');
const STATUS_STEPS = ['pending', 'preparing', 'ready', 'done'];

const STATUS_TEXT = {
  pending: 'Vi har tagit emot din beställning',
  preparing: 'Din mat tillagas just nu',
  ready: 'Klar för upphämtning',
  done: 'Beställning levererad. Smaklig måltid!'
};

const STEP_LABELS = {
  pending: 'Mottagen',
  preparing: 'Tillagas',
  ready: 'Klar',
  done: 'Levererad'
};

const ETA_TEXT = {
  pending: 'Beräknad tid: 10-15 min',
  preparing: 'Beräknad tid: 10-15 min',
  ready: 'Beräknad tid: Redo nu',
  done: 'Slutförd'
};

const TrackOrder = () => {
  const { trackingCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet(`/orders/track/${String(trackingCode || '').toUpperCase()}`);
        if (active) setOrder(data);
      } catch {
        if (active) {
          setOrder(null);
          setError('Ordern kunde inte hittas');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [trackingCode]);

  useEffect(() => {
    if (!trackingCode) return undefined;

    const socket = createSocket(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    socket.on('order:update', (updatedOrder) => {
      if (String(updatedOrder?.trackingCode || '').toUpperCase() === String(trackingCode).toUpperCase()) {
        setOrder((prev) => (prev ? { ...prev, ...updatedOrder } : updatedOrder));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [trackingCode]);

  const currentStepIndex = useMemo(() => {
    const idx = STATUS_STEPS.indexOf(order?.status);
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src="/images/hero-steak.png" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Track Hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        <h1 className="relative z-10 font-display text-5xl sm:text-7xl">Spåra Order</h1>
      </section>

      <section className="mx-auto max-w-4xl px-8 sm:px-12 lg:px-16 py-16">
        <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-4">Orderstatus</p>
        
        {loading ? (
          <div className="mt-8 border border-white/10 bg-white/5 p-8 text-white/70">Laddar beställning...</div>
        ) : error ? (
          <div className="mt-8 border border-red-400/40 bg-red-900/20 p-8">
            <p className="text-red-200">{error}</p>
            <Link
              to="/menu"
              className="mt-6 inline-block border border-gold px-8 py-4 text-[11px] uppercase tracking-[0.16em] text-gold hover:bg-gold hover:text-black transition-all"
            >
              Tillbaka till Menyn
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="border border-white/10 bg-panel/40 p-8 sm:p-12">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Ordernummer</p>
              <p className="mt-2 text-3xl text-gold font-display">{order?.trackingCode}</p>
              <div className="mt-6 space-y-1">
                <p className="text-xl text-white">{STATUS_TEXT[order?.status] || 'Status uppdaterad'}</p>
                <p className="text-sm text-gold/80">{ETA_TEXT[order?.status] || 'Beräknad tid: 10-15 min'}</p>
              </div>
            </div>

            <div className="border border-white/10 bg-panel/20 p-6 sm:p-8 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0">
                {STATUS_STEPS.map((step, index) => {
                  const active = index <= currentStepIndex;
                  return (
                    <div key={step} className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                          active ? 'border-gold bg-gold text-black scale-110 shadow-lg shadow-gold/20' : 'border-white/10 text-white/30'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest whitespace-nowrap ${active ? 'text-gold' : 'text-white/30'}`}>
                        {STEP_LABELS[step]}
                      </span>
                      {index < STATUS_STEPS.length - 1 && (
                        <div className={`hidden sm:block h-px flex-1 min-w-3 ml-2 ${active ? 'bg-gold/50' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-white/10 bg-panel/20 p-8 sm:p-12">
              <h2 className="font-display text-3xl mb-8">Beställningsdetaljer</h2>
              <div className="space-y-4">
                {(order?.items || []).map((item, idx) => {
                  const extras = item.extras || [];
                  const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
                  const basePrice = Math.max(0, (item.price || 0) - extrasTotal);
                  return (
                  <div key={`${item.name}-${idx}`} className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/90">
                        <span className="text-gold mr-3">{item.quantity}x</span>
                        {item.name}
                        <span className="ml-2 text-white/40 text-sm">({basePrice} kr)</span>
                      </p>
                      <p className="text-white/70">{Math.round(item.price * item.quantity)} KR</p>
                    </div>
                    {extras.length > 0 && (
                      <div className="mt-1.5 ml-8 space-y-0.5">
                        {extras.map((extra, eIdx) => (
                          <p key={`${extra.optionId}-${eIdx}`} className="text-[11px] text-gold/60 italic leading-tight">
                            • {extra.label} {extra.price > 0 && <span className="text-gold/40">(+{extra.price} kr)</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gold/20">
                <p className="text-white/65 uppercase tracking-widest text-xs">Totalt</p>
                <p className="text-2xl text-gold font-display">{Math.round(order?.totalAmount || 0)} KR</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default TrackOrder;

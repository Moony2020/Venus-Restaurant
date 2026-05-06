import { useEffect, useMemo, useRef, useState } from 'react';
import { io as createSocket } from 'socket.io-client';
import { apiGet, apiPatch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ACTIVE_STATUSES = ['pending', 'preparing', 'ready'];
const STATUS_ORDER = { pending: 0, preparing: 1, ready: 2 };
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const STATUS_CARD = {
  pending: 'border-white/20 bg-white/[0.04]',
  preparing: 'border-yellow-400/40 bg-yellow-500/[0.08]',
  ready: 'border-blue-400/40 bg-blue-500/[0.08]'
};

const STATUS_LABEL = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready'
};

const Kitchen = () => {
  const { token } = useAuth();
  const audioRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [highlightIds, setHighlightIds] = useState([]);
  const [printOrder, setPrintOrder] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.preload = 'auto';
    audio.volume = 0.35;
    audioRef.current = audio;

    const unlockAudio = () => setIsAudioUnlocked(true);
    window.addEventListener('pointerdown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      if (!token) return;
      try {
        setError('');
        setLoading(true);
        const data = await apiGet('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!active) return;
        const filtered = (data || []).filter((order) => ACTIVE_STATUSES.includes(order.status));
        setOrders(filtered);
      } catch {
        if (active) setError('Could not load kitchen orders.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = createSocket(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    const markHighlighted = (id) => {
      setHighlightIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
      setTimeout(() => {
        setHighlightIds((prev) => prev.filter((entry) => entry !== id));
      }, 3500);
    };

    socket.on('order:new', (order) => {
      if (!ACTIVE_STATUSES.includes(order.status)) return;
      setOrders((prev) => (prev.some((entry) => entry._id === order._id) ? prev : [order, ...prev]));
      markHighlighted(order._id);

      if (isSoundEnabled && isAudioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on('order:update', (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.some((entry) => entry._id === updatedOrder._id);

        if (updatedOrder.status === 'done') {
          return prev.filter((entry) => entry._id !== updatedOrder._id);
        }

        if (!ACTIVE_STATUSES.includes(updatedOrder.status)) {
          return prev.filter((entry) => entry._id !== updatedOrder._id);
        }

        if (!exists) return [updatedOrder, ...prev];
        return prev.map((entry) => (entry._id === updatedOrder._id ? { ...entry, ...updatedOrder } : entry));
      });

      markHighlighted(updatedOrder._id);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, isSoundEnabled, isAudioUnlocked]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const statusRank = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (statusRank !== 0) return statusRank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders]);

  const updateStatus = async (order, nextStatus) => {
    try {
      const updated = await apiPatch(
        `/orders/${order._id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => {
        if (updated.status === 'done') {
          return prev.filter((entry) => entry._id !== updated._id);
        }
        return prev.map((entry) => (entry._id === updated._id ? { ...entry, ...updated } : entry));
      });
    } catch {
      setError('Status update failed.');
    }
  };

  const getMinutesSince = (createdAt) => {
    const diff = now - new Date(createdAt).getTime();
    const mins = Math.max(0, Math.floor(diff / 60000));
    if (mins < 1) return 'just now';
    return `${mins} min ago`;
  };

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  return (
    <main className="min-h-screen bg-[#05090e] px-6 py-6 text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Kitchen Mode</p>
          <h1 className="font-display text-5xl">Live Order Board</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsSoundEnabled((prev) => !prev)}
          className="border border-white/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/85 hover:border-gold hover:text-gold"
        >
          Sound {isSoundEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {error && <div className="mb-4 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}

      {loading ? (
        <div className="border border-white/10 bg-white/[0.03] p-5 text-white/70">Loading kitchen board...</div>
      ) : sortedOrders.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">
          No active orders. Waiting for new orders...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedOrders.map((order) => (
            <article
              key={order._id}
              className={`border p-5 ${STATUS_CARD[order.status] || STATUS_CARD.pending} ${
                highlightIds.includes(order._id) ? 'ring-2 ring-gold/50' : ''
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-4xl text-gold">{order.trackingCode}</p>
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/65">{STATUS_LABEL[order.status]}</span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
                <div className="border border-white/10 bg-black/20 p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">Items</p>
                  <p className="mt-1 text-lg">{order.items?.length || 0}</p>
                </div>
                <div className="border border-white/10 bg-black/20 p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">Total</p>
                  <p className="mt-1 text-lg">{Math.round(order.totalAmount || 0)} SEK</p>
                </div>
                <div className="border border-white/10 bg-black/20 p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">Time</p>
                  <p className="mt-1 text-lg">{getMinutesSince(order.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-3 text-sm text-white/80">
                {(order.items || []).map((item, idx) => (
                  <p key={`${item.name}-${idx}`}>
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handlePrint(order)}
                  className="mb-2 w-full border border-white/25 py-2 text-[11px] uppercase tracking-[0.14em] text-white/80 hover:border-gold hover:text-gold"
                >
                  Print
                </button>
                {order.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(order, 'preparing')}
                    className="w-full border border-yellow-400/60 py-3 text-sm uppercase tracking-[0.16em] text-yellow-300 hover:bg-yellow-400 hover:text-black"
                  >
                    Start
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(order, 'ready')}
                    className="w-full border border-blue-400/60 py-3 text-sm uppercase tracking-[0.16em] text-blue-300 hover:bg-blue-400 hover:text-black"
                  >
                    Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(order, 'done')}
                    className="w-full border border-green-400/60 py-3 text-sm uppercase tracking-[0.16em] text-green-300 hover:bg-green-400 hover:text-black"
                  >
                    Done
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {printOrder && (
        <section className="print-receipt hidden">
          <div className="print-header">
            <h1>VENUS</h1>
            <p>KITCHEN RECEIPT</p>
          </div>

          <div className="print-row">
            <span>Order</span>
            <strong>{printOrder.trackingCode}</strong>
          </div>
          <div className="print-row">
            <span>Date</span>
            <span>{new Date(printOrder.createdAt).toLocaleString('sv-SE')}</span>
          </div>

          <hr />

          <div className="print-items">
            {(printOrder.items || []).map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="print-item">
                <span>{item.quantity} x {item.name}</span>
                <span>{Math.round(item.price * item.quantity)} SEK</span>
              </div>
            ))}
          </div>

          <hr />

          <div className="print-row">
            <strong>Total</strong>
            <strong>{Math.round(printOrder.totalAmount || 0)} SEK</strong>
          </div>

          {printOrder.notes ? (
            <div className="print-notes">
              <p>Notes</p>
              <p>{printOrder.notes}</p>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
};

export default Kitchen;

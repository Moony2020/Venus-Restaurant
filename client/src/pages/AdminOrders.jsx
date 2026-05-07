import { useEffect, useMemo, useRef, useState } from 'react';
import { io as createSocket } from 'socket.io-client';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/api';

const STATUS_OPTIONS = ['all', 'pending', 'preparing', 'ready', 'done'];
const STATUS_BADGE = {
  pending: 'bg-white/10 text-white/70 border-white/20',
  preparing: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  ready: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
  done: 'bg-green-600/20 text-green-300 border-green-500/40'
};

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.PROD ? undefined : 'http://localhost:5000');

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getNextStatuses = (status) => {
  if (status === 'pending') return ['preparing'];
  if (status === 'preparing') return ['ready'];
  if (status === 'ready') return ['done'];
  return [];
};

const pct = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

const fmtChange = (value) => {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

const changeClass = (value) => (value >= 0 ? 'text-green-400' : 'text-red-400');

const AdminOrders = () => {
  const { token } = useAuth();
  const audioRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [highlightIds, setHighlightIds] = useState([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [analyticsDays, setAnalyticsDays] = useState(14);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsCache, setAnalyticsCache] = useState({});

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

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setError('');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';

      const data = await apiGet(`/orders${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data || []);
    } catch {
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;

    if (analyticsCache[analyticsDays]) {
      setAnalytics(analyticsCache[analyticsDays]);
      return;
    }

    try {
      setAnalyticsLoading(true);
      const data = await apiGet(`/orders/analytics/daily?days=${analyticsDays}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const timeline = data?.timeline || [];
      setAnalytics(timeline);
      setAnalyticsCache((prev) => ({ ...prev, [analyticsDays]: timeline }));
    } catch {
      // keep dashboard usable if analytics fails
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, analyticsDays]);

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
      }, 3000);
    };

    socket.on('order:new', (order) => {
      setOrders((prev) => {
        if (prev.some((entry) => entry._id === order._id)) return prev;
        return [order, ...prev];
      });
      markHighlighted(order._id);

      if (isSoundEnabled && isAudioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on('order:update', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order))
      );
      markHighlighted(updatedOrder._id);
    });

    return () => socket.disconnect();
  }, [token, isSoundEnabled, isAudioUnlocked]);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => String(order.trackingCode || '').toLowerCase().includes(term));
  }, [orders, search]);

  const analyticsSummary = useMemo(() => {
    const totalOrders = analytics.reduce((sum, day) => sum + (day.ordersCount || 0), 0);
    const totalRevenue = analytics.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const today = analytics[analytics.length - 1] || { ordersCount: 0, revenue: 0 };
    const yesterday = analytics[analytics.length - 2] || { ordersCount: 0, revenue: 0 };
    const maxOrders = Math.max(1, ...analytics.map((d) => d.ordersCount || 0));
    const allZero = analytics.length === 0 || analytics.every((d) => (d.ordersCount || 0) === 0);

    return {
      totalOrders,
      totalRevenue,
      today,
      yesterday,
      maxOrders,
      allZero,
      ordersChange: pct(today.ordersCount || 0, yesterday.ordersCount || 0),
      revenueChange: pct(today.revenue || 0, yesterday.revenue || 0)
    };
  }, [analytics]);

  const updateStatus = async (id, nextStatus) => {
    try {
      const updated = await apiPatch(
        `/orders/${id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => prev.map((order) => (order._id === id ? { ...order, status: updated.status } : order)));
      setSelectedOrder((prev) => (prev && prev._id === id ? { ...prev, status: updated.status } : prev));
    } catch {
      setError('Failed to update order status.');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Admin</p>
            <h1 className="font-display text-6xl">Orders Dashboard</h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setIsSoundEnabled((prev) => !prev)}
              className="border border-white/10 bg-panel px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/80 hover:border-gold hover:text-gold"
            >
              Sound {isSoundEnabled ? 'On' : 'Off'}
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking code"
              className="border border-white/10 bg-panel px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-6 py-3 pr-12 text-[10px] uppercase tracking-widest text-white/70 focus:border-gold focus:outline-none"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'rgba(200, 164, 77, 0.5)\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.2em'
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-[#0a0a0b]">
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="mt-5 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Today Orders</p>
            <p className="mt-2 text-3xl text-gold">{analyticsSummary.today.ordersCount || 0}</p>
            <p className={`mt-1 text-xs ${changeClass(analyticsSummary.ordersChange)}`}>
              {fmtChange(analyticsSummary.ordersChange)} vs yesterday
            </p>
          </div>
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Today Revenue</p>
            <p className="mt-2 text-3xl text-gold">{Math.round(analyticsSummary.today.revenue || 0)} SEK</p>
            <p className={`mt-1 text-xs ${changeClass(analyticsSummary.revenueChange)}`}>
              {fmtChange(analyticsSummary.revenueChange)} vs yesterday
            </p>
          </div>
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Last {analyticsDays} Days</p>
            <p className="mt-2 text-3xl text-gold">{analyticsSummary.totalOrders} orders</p>
            <p className="mt-1 text-sm text-white/60">{Math.round(analyticsSummary.totalRevenue)} SEK revenue</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setAnalyticsDays(days)}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition ${
                analyticsDays === days
                  ? 'border-gold bg-gold text-black'
                  : 'border-white/15 bg-panel text-white/75 hover:border-gold hover:text-gold'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>

        {analyticsLoading ? (
          <div className="mt-4 border border-white/10 bg-panel p-6 text-sm text-white/60">Loading analytics...</div>
        ) : analyticsSummary.allZero ? (
          <div className="mt-4 border border-white/10 bg-panel p-6 text-sm text-white/65">No orders in this period.</div>
        ) : (
          <div className="mt-4 border border-white/10 bg-panel p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-white/50">Orders per day ({analyticsDays}d)</p>
            <div className="grid grid-cols-[32px_1fr] gap-3">
              <div className="flex h-16 flex-col justify-between text-[10px] text-white/45">
                <span>{analyticsSummary.maxOrders}</span>
                <span>{Math.round(analyticsSummary.maxOrders / 2)}</span>
                <span>0</span>
              </div>

              <div className="grid grid-cols-7 gap-2 md:grid-cols-14">
                {analytics.map((day) => {
                  const height = Math.max(8, Math.round(((day.ordersCount || 0) / analyticsSummary.maxOrders) * 56));
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2">
                      <div className="flex h-16 w-full items-end justify-center rounded border border-white/10 bg-black/20 p-1">
                        <div
                          className="w-full max-w-[20px] bg-gold/80"
                          style={{ height }}
                          title={`${day.date}: ${day.ordersCount} orders / ${Math.round(day.revenue || 0)} SEK`}
                        />
                      </div>
                      <span className="text-[10px] text-white/45">{day.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.18em] text-white/65">
              <tr>
                <th className="px-4 py-3">Tracking Code</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-white/60" colSpan="8">
                    Loading orders...
                  </td>
                </tr>
              ) : visibleOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-white/60" colSpan="8">
                    No orders found.
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order, index) => {
                  const nextStatuses = getNextStatuses(order.status);
                  return (
                    <tr
                      key={order._id}
                      className={`border-t border-white/10 ${index < 3 ? 'bg-gold/[0.03]' : ''} ${
                        highlightIds.includes(order._id) ? 'bg-gold/[0.10]' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-gold">{order.trackingCode}</td>
                      <td className="px-4 py-4">
                        <p>{order.customerName}</p>
                        <p className="text-xs text-white/50">{order.email}</p>
                      </td>
                      <td className="px-4 py-4">{order.items?.length || 0}</td>
                      <td className="px-4 py-4">{Math.round(order.totalAmount || 0)} SEK</td>
                      <td className="px-4 py-4 text-white/75">{order.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white/65">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:border-gold hover:text-gold"
                          >
                            View details
                          </button>
                          {nextStatuses.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              onClick={() => updateStatus(order._id, nextStatus)}
                              className="border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-gold hover:bg-gold hover:text-black"
                            >
                              Mark {nextStatus}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl border border-gold/30 bg-panel p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Order Details</p>
                <h2 className="mt-1 font-display text-4xl">{selectedOrder.trackingCode}</h2>
                <p className="mt-2 text-sm text-white/65">
                  {selectedOrder.customerName} · {selectedOrder.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-sm uppercase tracking-[0.16em] text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] uppercase tracking-[0.18em] text-white/65">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, i) => (
                    <tr key={`${item.name}-${i}`} className="border-t border-white/10">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.price} SEK</td>
                      <td className="px-4 py-3">{Math.round(item.price * item.quantity)} SEK</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-sm text-white/60">
                <p>Created: {formatDateTime(selectedOrder.createdAt)}</p>
                <p>
                  Mode: {selectedOrder.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}
                  {selectedOrder.deliveryFee ? ` · Avgift ${selectedOrder.deliveryFee} SEK` : ''}
                </p>
              </div>
              <p className="text-lg text-gold">{Math.round(selectedOrder.totalAmount || 0)} SEK</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;

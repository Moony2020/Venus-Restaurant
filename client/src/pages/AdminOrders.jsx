import { useEffect, useMemo, useRef, useState } from 'react';
import { io as createSocket } from 'socket.io-client';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/api';
import { Volume2, VolumeX, Search } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'preparing', 'ready', 'done'];
const STATUS_BADGE = {
  pending: 'bg-white/10 text-white/70 border-white/20',
  preparing: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  ready: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
  done: 'bg-green-600/20 text-green-300 border-green-500/40'
};

const STATUS_LABELS = {
  all: 'Alla statusar',
  pending: 'Väntande',
  preparing: 'Tillagas',
  ready: 'Klar',
  done: 'Slutförd'
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
  const pollingRef = useRef(null);

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
      setError('Kunde inte ladda beställningar.');
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

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(() => {
        fetchOrders();
      }, 12000);
    };

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

    socket.on('connect', stopPolling);
    socket.on('reconnect', () => {
      stopPolling();
      fetchOrders();
    });
    socket.on('disconnect', startPolling);

    return () => {
      stopPolling();
      socket.disconnect();
    };
  }, [token, isSoundEnabled, isAudioUnlocked]);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => 
      String(order.trackingCode || '').toLowerCase().includes(term) ||
      String(order.customerName || '').toLowerCase().includes(term)
    );
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
      setError('Misslyckades att uppdatera orderstatus.');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1800px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Admin Portal</p>
            <h1 className="font-display text-4xl sm:text-5xl">Beställningar</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsSoundEnabled((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[9px] uppercase tracking-[0.16em] transition-all duration-300 ${
                isSoundEnabled 
                  ? 'border-gold/30 bg-gold/10 text-gold' 
                  : 'border-white/10 bg-white/5 text-white/40'
              }`}
            >
              {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline">Ljud {isSoundEnabled ? 'På' : 'Av'}</span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök spårningskod..."
                className="rounded-lg border border-white/10 bg-panel pl-9 pr-4 py-2.5 text-[11px] text-white focus:border-gold outline-none w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-4 py-2.5 pr-10 text-[9px] uppercase tracking-widest text-white/70 focus:border-gold outline-none rounded-lg"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-[#0a0a0b]">
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="mt-5 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200 rounded-lg">{error}</div>}

        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3 max-[500px]:grid-cols-1">
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Beställningar idag</p>
            <p className="mt-2 text-3xl font-display text-gold">{analyticsSummary.today.ordersCount || 0}</p>
            <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${changeClass(analyticsSummary.ordersChange)}`}>
              {fmtChange(analyticsSummary.ordersChange)} vs igår
            </p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Omsättning idag</p>
            <p className="mt-2 text-3xl font-display text-green-400">{Math.round(analyticsSummary.today.revenue || 0)} kr</p>
            <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${changeClass(analyticsSummary.revenueChange)}`}>
              {fmtChange(analyticsSummary.revenueChange)} vs igår
            </p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl relative overflow-hidden max-[1023px]:hidden">
            <div className="relative z-10">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Senaste {analyticsDays} dagarna</p>
              <p className="mt-2 text-3xl font-display text-white">{analyticsSummary.totalOrders} <span className="text-[10px] font-sans text-white/40 uppercase tracking-widest">best.</span></p>
              <p className="mt-1 text-xs text-gold font-medium">{Math.round(analyticsSummary.totalRevenue)} kr totalt</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Volume2 size={80} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setAnalyticsDays(days)}
              className={`rounded-lg border px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                analyticsDays === days
                  ? 'border-gold bg-gold text-black shadow-lg shadow-gold/10'
                  : 'border-white/10 bg-panel text-white/50 hover:border-gold/50 hover:text-gold'
              }`}
            >
              {days} dagar
            </button>
          ))}
        </div>

        {!analyticsLoading && !analyticsSummary.allZero && (
          <div className="mt-6 border border-white/10 bg-panel p-6 rounded-xl overflow-x-auto">
            <p className="mb-6 text-[9px] uppercase tracking-[0.16em] text-white/50 font-bold">Beställningsvolym ({analyticsDays}d)</p>
            <div className="grid grid-cols-[40px_1fr] gap-6 min-w-[600px]">
              <div className="flex h-24 flex-col justify-between text-[9px] text-white/30 font-bold text-right pr-2">
                <span>{analyticsSummary.maxOrders}</span>
                <span>{Math.round(analyticsSummary.maxOrders / 2)}</span>
                <span>0</span>
              </div>

              <div className="flex gap-2 items-end">
                {analytics.map((day) => {
                  const height = Math.max(8, Math.round(((day.ordersCount || 0) / analyticsSummary.maxOrders) * 96));
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group/bar">
                      <div className="relative flex h-24 w-full items-end justify-center rounded-t-lg bg-white/[0.02] p-1 transition-colors group-hover/bar:bg-white/[0.05]">
                        <div
                          className="w-full rounded-t-sm bg-gradient-to-t from-gold/40 to-gold/80 transition-all duration-500 group-hover/bar:to-white"
                          style={{ height: `${height}px` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-white px-2 py-1 text-[10px] text-black font-bold transition-transform group-hover/bar:scale-100 whitespace-nowrap z-50">
                          {day.ordersCount} best. / {Math.round(day.revenue)} kr
                        </div>
                      </div>
                      <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{day.date.slice(8, 10)}/{day.date.slice(5, 7)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-panel">
          <table className="w-full min-w-[1100px] text-left text-sm border-collapse">
            <thead className="bg-white/5 text-[9px] uppercase tracking-[0.18em] text-white/60 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Spårningskod</th>
                <th className="px-6 py-4 whitespace-nowrap">Kund</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Artiklar</th>
                <th className="px-6 py-4 whitespace-nowrap">Summa</th>
                <th className="px-6 py-4 whitespace-nowrap">Typ</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Skapad</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-20 text-center text-white/40" colSpan="8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                      Laddar beställningar...
                    </div>
                  </td>
                </tr>
              ) : visibleOrders.length === 0 ? (
                <tr>
                  <td className="px-6 py-20 text-center text-white/40" colSpan="8">
                    Inga beställningar hittades.
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => {
                  const nextStatuses = getNextStatuses(order.status);
                  const isHighlighted = highlightIds.includes(order._id);
                  return (
                    <tr
                      key={order._id}
                      className={`border-t border-white/5 transition-colors duration-500 hover:bg-white/[0.02] ${
                        isHighlighted ? 'bg-gold/10' : ''
                      }`}
                    >
                      <td className="px-6 py-5 font-mono text-gold font-bold whitespace-nowrap text-xs">{order.trackingCode}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="font-medium text-xs">{order.customerName}</p>
                        <p className="text-[10px] text-white/40">{order.email}</p>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs">{order.items?.length || 0}</span>
                      </td>
                      <td className="px-6 py-5 font-medium whitespace-nowrap text-gold text-xs">{Math.round(order.totalAmount || 0)} kr</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">
                          {order.orderMode === 'delivery' ? 'Leverans' : 'Hämtning'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-bold uppercase tracking-[0.14em] ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[10px] text-white/40 whitespace-nowrap font-mono">{formatDateTime(order.createdAt)}</td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/50 transition hover:border-gold/50 hover:text-gold"
                          >
                            Visa
                          </button>
                          {nextStatuses.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              onClick={() => updateStatus(order._id, nextStatus)}
                              className="rounded-lg border border-gold/30 bg-gold px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-black transition hover:bg-white"
                            >
                              {nextStatus === 'preparing' ? 'Tillaga' : nextStatus === 'ready' ? 'Klar' : 'Slutför'}
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

      {/* Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e11]/90 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/[0.02]">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gold font-bold">Order Detaljer</p>
                <h2 className="mt-1 font-display text-4xl text-white">{selectedOrder.trackingCode}</h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                  <span className="font-medium text-white/80">{selectedOrder.customerName}</span>
                  <span>{selectedOrder.email}</span>
                  {selectedOrder.phone && <span className="font-mono">{selectedOrder.phone}</span>}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="group rounded-full bg-white/5 p-2 text-white/30 transition-all hover:bg-white/10 hover:text-white"
              >
                <VolumeX size={16} className="hidden" />
                <span className="text-[9px] uppercase tracking-widest font-bold px-2">Stäng</span>
              </button>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-white/40 font-bold border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3">Produkt</th>
                      <th className="px-4 py-3 text-center">Antal</th>
                      <th className="px-4 py-3 text-right">Pris</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, i) => (
                      <tr key={`${item.name}-${i}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-white/90 text-xs">{item.name}</p>
                          {item.optionSummary && (
                            <p className="mt-1 text-[10px] text-gold/60 italic leading-relaxed">Tillägg: {item.optionSummary}</p>
                          )}
                          {item.notes && (
                            <p className="mt-1 text-[10px] text-white/40 leading-relaxed">Notering: "{item.notes}"</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold">{item.quantity}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold text-gold text-xs">{Math.round(item.price * item.quantity)} kr</p>
                          <p className="text-[9px] text-white/30 font-mono mt-0.5">{item.price} kr/st</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-white/5 p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-white/40 font-bold">
                  <p className="uppercase tracking-widest">Typ: <span className="text-white/80">{selectedOrder.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</span></p>
                  <p className="mt-1.5 uppercase tracking-widest">Skapad: <span className="text-white/80 font-mono">{formatDateTime(selectedOrder.createdAt)}</span></p>
                  {selectedOrder.deliveryFee > 0 && <p className="mt-1.5 uppercase tracking-widest text-gold/60">Leveransavgift: {selectedOrder.deliveryFee} kr</p>}
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Totalsumma</p>
                  <p className="text-4xl font-display text-gold">{Math.round(selectedOrder.totalAmount || 0)} kr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;

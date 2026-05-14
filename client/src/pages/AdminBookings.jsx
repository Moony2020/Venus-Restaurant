import { useEffect, useMemo, useState } from 'react';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/api';
import { X, MessageSquare, Search } from 'lucide-react';

const STATUS_BADGE = {
  new: 'bg-white/10 text-white/70 border-white/20',
  confirmed: 'bg-green-600/20 text-green-300 border-green-500/40',
  cancelled: 'bg-red-600/20 text-red-300 border-red-500/40'
};

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

const AdminBookings = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotes, setSelectedNotes] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setError('');
      const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const data = await apiGet(`/bookings${qs}`);
      setBookings(data || []);
    } catch {
      setError('Kunde inte ladda bokningar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, statusFilter]);

  const visibleBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter((b) => {
      return (
        String(b.name || '').toLowerCase().includes(term) ||
        String(b.email || '').toLowerCase().includes(term) ||
        String(b.phone || '').toLowerCase().includes(term)
      );
    });
  }, [bookings, search]);

  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        if (booking.status === 'new') acc.new += 1;
        if (booking.status === 'confirmed') acc.confirmed += 1;
        if (booking.status === 'cancelled') acc.cancelled += 1;
        return acc;
      },
      { total: 0, new: 0, confirmed: 0, cancelled: 0 }
    );
  }, [bookings]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiPatch(
        `/bookings/${id}/status`,
        { status }
      );
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: updated.status } : b)));
    } catch {
      setError('Misslyckades att uppdatera bokningsstatus.');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1800px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Admin Portal</p>
            <h1 className="font-display text-4xl sm:text-5xl">Bokningar</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök namn, e-post eller tel"
                className="rounded-lg border border-white/10 bg-panel pl-9 pr-4 py-2.5 text-[11px] text-white focus:border-gold outline-none w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-4 py-2.5 pr-10 text-[9px] uppercase tracking-widest text-white/70 focus:border-gold outline-none rounded-lg"
            >
              <option value="all" className="bg-[#0a0a0b]">Alla statusar</option>
              <option value="new" className="bg-[#0a0a0b]">Ny</option>
              <option value="confirmed" className="bg-[#0a0a0b]">Bekräftad</option>
              <option value="cancelled" className="bg-[#0a0a0b]">Avbruten</option>
            </select>
          </div>
        </div>

        {error && <div className="mt-5 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200 rounded-lg">{error}</div>}

        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4 max-[500px]:grid-cols-1">
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Total</p>
            <p className="mt-2 text-3xl font-display text-gold">{stats.total}</p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Nya</p>
            <p className="mt-2 text-3xl font-display text-white">{stats.new}</p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Bekräftade</p>
            <p className="mt-2 text-3xl font-display text-green-400">{stats.confirmed}</p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Avbrutna</p>
            <p className="mt-2 text-3xl font-display text-red-400">{stats.cancelled}</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-panel">
          <table className="w-full min-w-[1200px] text-left text-sm border-collapse">
            <thead className="bg-white/5 text-[9px] uppercase tracking-[0.18em] text-white/60 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Namn</th>
                <th className="px-6 py-4 whitespace-nowrap">E-post</th>
                <th className="px-6 py-4 whitespace-nowrap">Telefon</th>
                <th className="px-6 py-4 whitespace-nowrap">Datum</th>
                <th className="px-6 py-4 whitespace-nowrap">Tid</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Gäster</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Önskemål</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Skapad</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-20 text-center text-white/40" colSpan="10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                      Laddar bokningar...
                    </div>
                  </td>
                </tr>
              ) : visibleBookings.length === 0 ? (
                <tr>
                  <td className="px-6 py-20 text-center text-white/40" colSpan="10">
                    Inga bokningar hittades.
                  </td>
                </tr>
              ) : (
                visibleBookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-medium whitespace-nowrap">{booking.name}</td>
                    <td className="px-6 py-5 text-white/60 whitespace-nowrap">{booking.email}</td>
                    <td className="px-6 py-5 text-white/60 whitespace-nowrap font-mono">{booking.phone}</td>
                    <td className="px-6 py-5 whitespace-nowrap">{booking.date}</td>
                    <td className="px-6 py-5 whitespace-nowrap font-medium text-gold">{booking.time}</td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs">{booking.guests}</span>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      {booking.notes ? (
                        <button
                          onClick={() => setSelectedNotes({ notes: booking.notes, name: booking.name })}
                          className="flex items-center gap-2 mx-auto rounded-lg border border-gold/20 bg-gold/5 px-3 py-1.5 text-[9px] uppercase tracking-widest text-gold transition hover:bg-gold hover:text-black"
                        >
                          <MessageSquare size={12} />
                          Visa
                        </button>
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-bold uppercase tracking-[0.14em] ${
                          STATUS_BADGE[booking.status] || STATUS_BADGE.new
                        }`}
                      >
                        {booking.status === 'new' ? 'NY' : booking.status === 'confirmed' ? 'BEKRÄFTAD' : 'AVBRUTEN'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[10px] text-white/40 whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {booking.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="rounded-lg border border-green-400/30 bg-green-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-green-400 transition hover:bg-green-400 hover:text-black"
                          >
                            Bekräfta
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-red-400 transition hover:bg-red-400 hover:text-black"
                          >
                            Avbryt
                          </button>
                        )}
                        {booking.status !== 'new' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'new')}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40 transition hover:border-gold hover:text-gold"
                          >
                            Återställ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notes Modal */}
      {selectedNotes && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={() => setSelectedNotes(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e11]/90 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-white/5 p-4 bg-white/[0.02]">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-gold font-black">Önskemål</p>
                <h3 className="mt-0.5 font-display text-lg text-white/90">{selectedNotes.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedNotes(null)} 
                className="group rounded-full bg-white/5 p-2 text-white/30 transition-all hover:bg-white/10 hover:text-white"
              >
                <X size={16} className="transition-transform group-hover:rotate-90" />
              </button>
            </div>
            <div className="p-8 text-center bg-gradient-to-b from-transparent to-white/[0.01]">
              <p className="text-sm leading-relaxed text-white/70 font-normal">
                {selectedNotes.notes}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminBookings;

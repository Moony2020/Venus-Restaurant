import { useEffect, useMemo, useState } from 'react';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/api';

const STATUS_OPTIONS = ['all', 'new', 'confirmed', 'cancelled'];
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
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setError('');
      const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const data = await apiGet(`/bookings${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data || []);
    } catch {
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

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
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: updated.status } : b)));
    } catch {
      setError('Failed to update booking status.');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Admin</p>
            <h1 className="font-display text-6xl">Bookings Dashboard</h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone"
              className="border border-white/10 bg-panel px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-6 py-3 pr-12 text-[10px] uppercase tracking-widest text-white/70 focus:border-gold focus:outline-none"
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Total</p>
            <p className="mt-2 text-3xl text-gold">{stats.total}</p>
          </div>
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">New</p>
            <p className="mt-2 text-3xl text-white">{stats.new}</p>
          </div>
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Confirmed</p>
            <p className="mt-2 text-3xl text-green-300">{stats.confirmed}</p>
          </div>
          <div className="border border-white/10 bg-panel p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Cancelled</p>
            <p className="mt-2 text-3xl text-red-300">{stats.cancelled}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.18em] text-white/65">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-white/60" colSpan="9">
                    Loading bookings...
                  </td>
                </tr>
              ) : visibleBookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-white/60" colSpan="9">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                visibleBookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-white/10">
                    <td className="px-4 py-4">{booking.name}</td>
                    <td className="px-4 py-4">{booking.email}</td>
                    <td className="px-4 py-4">{booking.phone}</td>
                    <td className="px-4 py-4">{booking.date}</td>
                    <td className="px-4 py-4">{booking.time}</td>
                    <td className="px-4 py-4">{booking.guests}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                          STATUS_BADGE[booking.status] || STATUS_BADGE.new
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white/65">{formatDateTime(booking.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="border border-green-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-green-300 hover:bg-green-400 hover:text-black"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="border border-red-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-red-300 hover:bg-red-400 hover:text-black"
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status !== 'new' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(booking._id, 'new')}
                            className="border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:border-gold hover:text-gold"
                          >
                            Reset
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
    </main>
  );
};

export default AdminBookings;

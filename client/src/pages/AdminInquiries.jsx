import { useEffect, useMemo, useState } from 'react';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/api';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'booked', 'cancelled'];
const PAYMENT_OPTIONS = ['all', 'paid', 'unpaid'];

const STATUS_BADGE = {
  new: 'bg-white/10 text-white/70 border-white/20',
  contacted: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
  booked: 'bg-green-600/20 text-green-300 border-green-500/40',
  cancelled: 'bg-red-600/20 text-red-300 border-red-500/40'
};

const AdminInquiries = () => {
  const { isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInquiries = async () => {
    if (!isAuthenticated) return;
    try {
      setError('');
      const qs = [];
      if (statusFilter !== 'all') qs.push(`status=${statusFilter}`);
      if (paymentFilter !== 'all') qs.push(`payment=${paymentFilter}`);
      const query = qs.length > 0 ? `?${qs.join('&')}` : '';
      const data = await apiGet(`/inquiries${query}`);
      setInquiries(data || []);
    } catch {
      setError('Kunde inte ladda förfrågningar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    return inquiries.reduce(
      (acc, inquiry) => {
        acc.total += 1;
        if (inquiry.paymentStatus === 'paid') acc.paid += 1;
        if (inquiry.status === 'booked') acc.booked += 1;
        if (inquiry.status === 'new') acc.new += 1;
        return acc;
      },
      { total: 0, paid: 0, booked: 0, new: 0 }
    );
  }, [inquiries]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiPatch(
        `/inquiries/${id}/status`,
        { status }
      );
      setInquiries((prev) => prev.map((l) => (l._id === id ? { ...l, status: updated.status } : l)));
    } catch {
      setError('Misslyckades att uppdatera status.');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1800px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Admin Portal</p>
            <h1 className="font-display text-4xl sm:text-5xl">Förfrågningar</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-4 py-2.5 pr-10 text-[9px] uppercase tracking-widest text-white/70 focus:border-gold focus:outline-none rounded-lg"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-[#0a0a0b]">
                  {status === 'all' ? 'Alla statusar' : status === 'new' ? 'Ny' : status === 'contacted' ? 'Kontaktad' : status === 'booked' ? 'Bokad' : 'Avbokad'}
                </option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="appearance-none border border-white/10 bg-panel px-4 py-2.5 pr-10 text-[9px] uppercase tracking-widest text-white/70 focus:border-gold focus:outline-none rounded-lg"
            >
              {PAYMENT_OPTIONS.map((payment) => (
                <option key={payment} value={payment} className="bg-[#0a0a0b]">
                  {payment === 'all' ? 'Alla betalningar' : payment === 'paid' ? 'Betald' : 'Obetald'}
                </option>
              ))}
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
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Betalda</p>
            <p className="mt-2 text-3xl font-display text-green-400">{stats.paid}</p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Bokade</p>
            <p className="mt-2 text-3xl font-display text-blue-400">{stats.booked}</p>
          </div>
          <div className="border border-white/10 bg-panel p-5 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Nya</p>
            <p className="mt-2 text-3xl font-display text-white">{stats.new}</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-panel">
          <table className="w-full min-w-[1200px] text-left text-sm border-collapse">
            <thead className="bg-white/5 text-[9px] uppercase tracking-[0.18em] text-white/60 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Namn</th>
                <th className="px-6 py-4 whitespace-nowrap">E-post</th>
                <th className="px-6 py-4 whitespace-nowrap">Event</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Gäster</th>
                <th className="px-6 py-4 whitespace-nowrap">Datum</th>
                <th className="px-6 py-4 whitespace-nowrap">Budget</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Betalning</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-20 text-center text-white/40" colSpan="9">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                      Laddar...
                    </div>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td className="px-6 py-24 text-center" colSpan="9">
                    <p className="text-white/40">Inga förfrågningar hittades.</p>
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-medium whitespace-nowrap">{inquiry.fullName}</td>
                    <td className="px-6 py-5 text-white/60 whitespace-nowrap">{inquiry.email}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-[10px] uppercase tracking-wider text-gold/80">{inquiry.eventType}</span>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs">{inquiry.guests}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">{inquiry.preferredDate || '-'}</td>
                    <td className="px-6 py-5 whitespace-nowrap font-medium text-gold">{inquiry.budgetRange || '-'}</td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      {inquiry.paymentStatus === 'paid' ? (
                        <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-[9px] font-bold text-green-400 border border-green-500/20">BETALD</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[9px] font-bold text-white/30 border border-white/10">OBETALD</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
                          STATUS_BADGE[inquiry.status] || STATUS_BADGE.new
                        }`}
                      >
                        {inquiry.status === 'new' ? 'NY' : inquiry.status === 'contacted' ? 'KONTAKTAD' : inquiry.status === 'booked' ? 'BOKAD' : 'AVBOKAD'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {inquiry.status !== 'booked' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(inquiry._id, 'booked')}
                            className="rounded-lg border border-green-400/30 bg-green-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-green-400 transition hover:bg-green-400 hover:text-black"
                          >
                            Boka
                          </button>
                        )}
                        {inquiry.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(inquiry._id, 'contacted')}
                            className="rounded-lg border border-blue-400/30 bg-blue-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-400 transition hover:bg-blue-400 hover:text-black"
                          >
                            Kontakta
                          </button>
                        )}
                        {inquiry.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(inquiry._id, 'cancelled')}
                            className="rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-red-400 transition hover:bg-red-400 hover:text-black"
                          >
                            Avbryt
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

export default AdminInquiries;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from '../layout/AdminHeader';
import { apiGet, apiPatch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const statuses = ['new', 'contacted', 'booked'];
const paymentStatuses = ['all', 'pending', 'paid'];

const statusBadgeClass = {
  new: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  contacted: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
  booked: 'bg-green-600/20 text-green-300 border-green-500/40'
};

const paymentBadgeClass = {
  paid: 'bg-green-600/20 text-green-300 border-green-500/40',
  pending: 'bg-white/10 text-white/70 border-white/20'
};

const AdminLeads = () => {
  const navigate = useNavigate();
  const { token, isAdmin, isCheckingAuth } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, booked: 0, new: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLeads() {
      if (isCheckingAuth) return;
      if (!token) return navigate('/login');
      if (!isAdmin) return navigate('/');

      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const data = await apiGet(`/leads${qs}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeads(data);
        const statsData = await apiGet('/leads/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsData);
      } catch {
        setError('Could not load leads. Admin token required.');
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [statusFilter, paymentFilter, token, isAdmin, isCheckingAuth, navigate]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiPatch(`/leads/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads((prev) => prev.map((lead) => (lead._id === id ? updated : lead)));
    } catch {
      setError('Failed to update lead status');
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Admin</p>
            <h1 className="font-display text-6xl">Leads Dashboard</h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-panel border border-white/10 px-6 py-3 pr-12 text-[10px] uppercase tracking-widest text-white/70 focus:border-gold outline-none cursor-pointer hover:border-white/30 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(200, 164, 77, 0.5)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.2em'
                }}
              >
                <option value="all" className="bg-[#0a0a0b]">All Statuses</option>
                <option value="new" className="bg-[#0a0a0b]">New</option>
                <option value="contacted" className="bg-[#0a0a0b]">Contacted</option>
                <option value="booked" className="bg-[#0a0a0b]">Booked</option>
              </select>
            </div>

            <div className="relative group">
              <select 
                value={paymentFilter} 
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="appearance-none bg-panel border border-white/10 px-6 py-3 pr-12 text-[10px] uppercase tracking-widest text-white/70 focus:border-gold outline-none cursor-pointer hover:border-white/30 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(200, 164, 77, 0.5)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.2em'
                }}
              >
                <option value="all" className="bg-[#0a0a0b]">All Payments</option>
                <option value="pending" className="bg-[#0a0a0b]">Pending</option>
                <option value="paid" className="bg-[#0a0a0b]">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="mt-5 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Total</p><p className="mt-2 text-2xl">{stats.total || 0}</p></div>
          <div className="border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Paid</p><p className="mt-2 text-2xl text-green-300">{stats.paid || 0}</p></div>
          <div className="border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Booked</p><p className="mt-2 text-2xl text-gold">{stats.booked || 0}</p></div>
          <div className="border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-white/60">New</p><p className="mt-2 text-2xl text-yellow-300">{stats.new || 0}</p></div>
        </div>

        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.18em] text-white/65">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Guests</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-8 text-white/60" colSpan="8">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-10" colSpan="8">
                    <div className="flex flex-col items-start gap-3 text-white/65">
                      <p className="text-sm">No leads found.</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">Create one from the Bespoke form to start tracking requests.</p>
                      <Link to="/bespoke" className="border border-gold/60 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold transition hover:bg-gold hover:text-black">
                        Open Bespoke Form
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-4">{lead.fullName}</td><td className="px-4 py-4">{lead.email}</td><td className="px-4 py-4">{lead.eventType}</td><td className="px-4 py-4">{lead.guests}</td><td className="px-4 py-4">{lead.preferredDate || '-'}</td><td className="px-4 py-4">{lead.budgetRange || '-'}</td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${paymentBadgeClass[lead.paymentStatus] || paymentBadgeClass.pending}`}>{lead.paymentStatus || 'pending'}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${statusBadgeClass[lead.status] || statusBadgeClass.new}`}>{lead.status}</span>
                        <select value={lead.status} onChange={(e) => updateStatus(lead._id, e.target.value)} className="border border-gold/30 bg-transparent px-2 py-1 text-xs uppercase">{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
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

export default AdminLeads;

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiGet } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const BookingSuccess = () => {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const leadId = params.get('leadId');

  useEffect(() => {
    let active = true;

    async function loadLead() {
      if (!token || !leadId) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await apiGet(`/leads/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (active) setLead(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLead();
    return () => {
      active = false;
    };
  }, [token, leadId]);

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Booking Confirmed</p>
        <h1 className="mt-3 font-display text-6xl">Tack för din bokning</h1>
        <p className="mt-5 text-white/70">Din deposition är registrerad. Vårt team kontaktar dig inom 24 timmar.</p>

        {loading ? (
          <p className="mt-10 text-white/60">Loading booking details...</p>
        ) : lead ? (
          <div className="mx-auto mt-10 max-w-xl border border-gold/30 bg-white/[0.02] p-6 text-left">
            <p><span className="text-white/60">Lead ID:</span> {lead._id}</p>
            <p><span className="text-white/60">Name:</span> {lead.fullName}</p>
            <p><span className="text-white/60">Event:</span> {lead.eventType}</p>
            <p><span className="text-white/60">Guests:</span> {lead.guests}</p>
            <p><span className="text-white/60">Payment:</span> {lead.paymentStatus}</p>
            <p><span className="text-white/60">Status:</span> {lead.status}</p>
          </div>
        ) : (
          <p className="mt-10 text-white/60">No booking details available.</p>
        )}

        <div className="mt-10 flex justify-center gap-4">
          <Link to="/account" className="border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black">My Account</Link>
          <Link to="/" className="border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.2em]">Back Home</Link>
        </div>
      </section>
    </main>
  );
};

export default BookingSuccess;

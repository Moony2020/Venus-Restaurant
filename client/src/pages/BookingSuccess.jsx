import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiGet } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const BookingSuccess = () => {
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  const inquiryId = params.get('inquiryId');

  useEffect(() => {
    let active = true;

    async function loadInquiry() {
      if (!isAuthenticated || !inquiryId) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await apiGet(`/inquiries/${inquiryId}`);
        if (active) setInquiry(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInquiry();
    return () => {
      active = false;
    };
  }, [isAuthenticated, inquiryId]);

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-bold">Inquiry Confirmed</p>
        <h1 className="mt-3 font-display text-6xl">Tack för din bokning</h1>
        <p className="mt-5 text-white/70 leading-relaxed">Din deposition är registrerad. Vårt team kontaktar dig inom 24 timmar för att bekräfta detaljerna.</p>

        {loading ? (
          <p className="mt-10 text-white/60">Laddar detaljer...</p>
        ) : inquiry ? (
          <div className="mx-auto mt-10 max-w-xl border border-gold/20 bg-white/[0.02] p-8 text-left rounded-2xl">
            <h3 className="text-xs uppercase tracking-widest text-gold mb-6 font-bold">Bokningssammanfattning</h3>
            <div className="space-y-4 text-sm">
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/40 uppercase text-[10px] tracking-wider">ID</span> <span className="font-mono text-xs">{inquiry._id}</span></p>
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/40 uppercase text-[10px] tracking-wider">Namn</span> {inquiry.fullName}</p>
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/40 uppercase text-[10px] tracking-wider">Typ</span> {inquiry.eventType}</p>
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/40 uppercase text-[10px] tracking-wider">Gäster</span> {inquiry.guests}</p>
              <p className="flex justify-between"><span className="text-white/40 uppercase text-[10px] tracking-wider">Status</span> <span className="text-green-400 font-bold uppercase text-[10px] tracking-widest">{inquiry.paymentStatus === 'paid' ? 'BETALD' : 'VÄNTAR'}</span></p>
            </div>
          </div>
        ) : (
          <p className="mt-10 text-white/60">Inga detaljer tillgängliga.</p>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link to="/account" className="border border-gold px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black transition-all rounded-lg">Mitt Konto</Link>
          <Link to="/" className="border border-white/10 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all rounded-lg">Till Hemmen</Link>
        </div>
      </section>
    </main>
  );
};

export default BookingSuccess;

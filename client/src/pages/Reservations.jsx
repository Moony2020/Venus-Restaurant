import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiPost } from '../lib/api';

const Reservations = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    date: '',
    time: '19:00',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '19:00';
    const guests = searchParams.get('guests') || '2';

    setForm((prev) => ({
      ...prev,
      date,
      time,
      guests
    }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg('');
    try {
      await apiPost('/bookings', form);
      setMsg('Bokning bekräftad! Ett e-postmeddelande har skickats.');
      setForm({ date: '', time: '19:00', guests: '2', name: '', email: '', phone: '', notes: '' });
    } catch {
      setMsg('Ett fel uppstod. Vänligen försök igen eller ring oss.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src="/images/reservations-hero.png" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Bordsbokning" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        <h1 className="relative z-10 font-display text-5xl sm:text-7xl">Boka Bord</h1>
      </section>

      <section className="relative z-20 mx-auto max-w-4xl px-8 pt-4 pb-20">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-panel p-8 sm:p-12">
            {msg && (
              <div className={`mb-8 p-4 text-sm ${msg.includes('bekräftad') ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-[1.2fr_1fr_1fr] gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Datum</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 pr-2 focus:border-gold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Tid</label>
                  <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none appearance-none">
                    {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Gäster</label>
                  <input type="number" min="1" max="12" required value={form.guests} onChange={e => setForm({...form, guests: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none" />
                </div>
              </div>

              <div className="space-y-6">
                <input placeholder="Fullständigt namn" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none" />
                <input type="email" placeholder="E-post" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none" />
                <input type="tel" placeholder="Telefon" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none" />
                <textarea placeholder="Speciella önskemål (valfritt)" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 pl-2 focus:border-gold outline-none" />
              </div>

              <button disabled={isSubmitting} className="w-full rounded-lg bg-gold py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-black transition-all hover:bg-goldSoft">
                {isSubmitting ? 'Bokar...' : 'Bekräfta bokning'}
              </button>
            </form>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-gold">Öppettider</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Tisdag - Torsdag: 17:00 - 23:00<br />
                Fredag - Lördag: 16:00 - 01:00<br />
                Söndag - Måndag: Stängt
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-gold">Adress</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Varberga Centrum 2<br />
                703 52 Örebro<br />
                Sverige
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Reservations;

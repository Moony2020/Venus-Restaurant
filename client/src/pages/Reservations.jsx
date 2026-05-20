import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiPost } from '../lib/api';

import { useRestaurantStatus } from '../hooks/useRestaurantStatus';

const DAY_MAP = {
  monday: 'Måndag',
  tuesday: 'Tisdag',
  wednesday: 'Onsdag',
  thursday: 'Torsdag',
  friday: 'Fredag',
  saturday: 'Lördag',
  sunday: 'Söndag'
};

const WEEK_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Reservations = () => {
  const { data: restaurantData } = useRestaurantStatus();
  const [searchParams] = useSearchParams();
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
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
      setTimeout(() => setMsg(''), 5000);
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

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Date on its own line */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Datum</label>
                <input 
                  type="date" 
                  required 
                  value={form.date} 
                  onChange={e => setForm({...form, date: e.target.value})} 
                  className="w-full border-b border-white/10 bg-transparent py-4 text-lg text-gold focus:border-gold outline-none" 
                />
              </div>

              {/* Time and Guests side by side */}
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Tid</label>
                  <select 
                    value={form.time} 
                    onChange={e => setForm({...form, time: e.target.value})} 
                    className="w-full border-b border-white/10 bg-transparent py-4 focus:border-gold outline-none appearance-none"
                  >
                    {['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'].map(t => <option key={t} className="bg-background">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Gäster</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12" 
                    required 
                    value={form.guests} 
                    onChange={e => setForm({...form, guests: e.target.value})} 
                    className="w-full border-b border-white/10 bg-transparent py-4 focus:border-gold outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <input placeholder="Fullständigt namn" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 focus:border-gold outline-none" />
                <input type="email" placeholder="E-post" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 focus:border-gold outline-none" />
                <input type="tel" placeholder="Telefon" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 focus:border-gold outline-none" />
                <textarea placeholder="Speciella önskemål (valfritt)" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border-b border-white/10 bg-transparent py-3 focus:border-gold outline-none" />
              </div>

              <div className="flex justify-start pt-2">
                <button 
                  disabled={isSubmitting} 
                  className="w-full sm:w-fit rounded-full bg-gold px-10 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-goldSoft hover:scale-105 active:scale-95 shadow-xl shadow-gold/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Bokar...' : 'Bekräfta bokning'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-gold">Öppettider</h3>
                {restaurantData?.nowStatus && (
                  <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                    restaurantData.nowStatus.isOpen 
                      ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${restaurantData.nowStatus.isOpen ? 'animate-pulse bg-green-400' : 'bg-red-400'}`} />
                    {restaurantData.nowStatus.isOpen ? 'Öppet nu' : 'Stängt'}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {WEEK_KEYS.map((key) => {
                  const oh = restaurantData?.week?.[key];
                  const dayName = DAY_MAP[key];
                  
                  // Logic to highlight the "active" day
                  // If we are open from yesterday, highlight yesterday
                  const status = restaurantData?.nowStatus;
                  const isRolloverActive = status?.text?.includes('från igår') && status?.isOpen;
                  
                  const todayKey = WEEK_KEYS[(new Date().getDay() + 6) % 7]; // Convert 0-6 (Sun-Sat) to Monday-start index
                  const yesterdayKey = WEEK_KEYS[(new Date().getDay() + 5) % 7];
                  
                  const isHighlighted = isRolloverActive 
                    ? key === yesterdayKey 
                    : key === todayKey;

                  return (
                    <div key={key} className={`flex gap-3 text-[13px] leading-relaxed transition-all duration-300 ${isHighlighted ? 'text-white font-bold' : 'text-white/40'}`}>
                      <span className="w-20 shrink-0">{dayName}:</span>
                      {oh?.closed ? (
                        <span className="text-red-500/60 uppercase tracking-tighter">Stängt</span>
                      ) : (
                        <span className={isHighlighted ? 'text-gold' : ''}>{oh?.open} - {oh?.close}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-gold">Adress</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Varbergagatan 39A<br />
                703 51 Örebro<br />
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

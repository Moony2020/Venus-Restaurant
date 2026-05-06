import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReservationSection = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [time, setTime] = useState('19:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    if (time) params.set('time', time);
    navigate(`/reservations?${params.toString()}`);
  };

  return (
    <section className="bg-background py-32 px-6">
      <div className="mx-auto max-w-4xl border border-gold/15 bg-panel/30 p-12 sm:p-20 text-center">
        <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-8">Bordsbokning</p>
        <h2 className="font-display text-5xl sm:text-7xl mb-12 text-white">Säkra din upplevelse</h2>

        <form onSubmit={handleSubmit} className="text-left">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Datum</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Antal personer</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none appearance-none"
              >
                <option value="2">2 Personer</option>
                <option value="3">3 Personer</option>
                <option value="4">4 Personer</option>
                <option value="5">5 Personer</option>
                <option value="6">6 Personer</option>
                <option value="7">Fler än 6</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Tid</label>
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="mt-16 min-w-[240px] border border-gold bg-transparent px-10 py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black"
            >
              Bekräfta bokning
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ReservationSection;


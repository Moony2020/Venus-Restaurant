import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Info, Calendar, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
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

const ALL_TIMES = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

const SITTINGS = [
  {
    title: 'LUNCH (11:00 – 14:00)',
    badge: 'Dagens servering',
    slots: ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30']
  },
  {
    title: 'EFTERMIDDAG (14:00 – 17:00)',
    badge: 'Avskilt & Lugnt',
    slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
  },
  {
    title: 'KVÄLLSSITTNING (17:00 – 21:00)',
    badge: 'Matsalen & Elden',
    slots: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
  }
];

const timeToMinutes = (hhmm) => {
  const normalized = String(hhmm || '').trim().replace('.', ':');
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  let h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  if (h < 0 || h > 24 || m < 0 || m > 59) return 0;
  if (h === 24 && m !== 0) h = 0;
  return h * 60 + m;
};

const isTimeWithinHours = (timeStr, openTime, closeTime) => {
  const timeMin = timeToMinutes(timeStr);
  const openMin = timeToMinutes(openTime);
  let closeMin = timeToMinutes(closeTime);
  
  if (closeTime === '00:00' || closeTime === '24:00' || closeMin === 0) {
    closeMin = 1440;
  }
  
  const isRollover = closeMin < openMin;
  if (isRollover) {
    return timeMin >= openMin || timeMin < closeMin;
  }
  return timeMin >= openMin && timeMin < closeMin;
};

const getWeekdayFromDateStr = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return null;
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return weekdays[dateObj.getDay()];
};

const Reservations = () => {
  const { data: restaurantData } = useRestaurantStatus();
  const [searchParams] = useSearchParams();

  // Compute default date: today
  const defaultDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [form, setForm] = useState({
    date: defaultDate,
    time: '19:00',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  // Generate 4 quick date chips
  const quickDates = useMemo(() => {
    const swedishDays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    const swedishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const chips = [];

    for (let i = 0; i < 4; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = swedishDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = swedishMonths[d.getMonth()];

      const label = i === 0
        ? `Idag (${dayName} ${dayNum} ${monthName})`
        : i === 1
          ? `Imorgon (${dayName} ${dayNum} ${monthName})`
          : `${dayName} (${dayNum} ${monthName})`;

      chips.push({ dateStr, label });
    }
    return chips;
  }, []);

  const selectedWeekday = useMemo(() => getWeekdayFromDateStr(form.date), [form.date]);
  const dayConfig = useMemo(() => {
    if (!selectedWeekday || !restaurantData?.week) return null;
    return restaurantData.week[selectedWeekday];
  }, [selectedWeekday, restaurantData]);

  const isDayClosed = useMemo(() => dayConfig ? Boolean(dayConfig.closed) : false, [dayConfig]);

  const filteredTimes = useMemo(() => {
    if (!restaurantData?.week || !dayConfig) return ALL_TIMES;
    if (isDayClosed) return [];
    return ALL_TIMES.filter((t) => isTimeWithinHours(t, dayConfig.open, dayConfig.close));
  }, [restaurantData, dayConfig, isDayClosed]);

  useEffect(() => {
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const guests = searchParams.get('guests');

    setForm((prev) => ({
      ...prev,
      ...(date ? { date } : {}),
      ...(time ? { time } : {}),
      ...(guests ? { guests } : {})
    }));
  }, [searchParams]);

  useEffect(() => {
    if (filteredTimes.length > 0 && !filteredTimes.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: filteredTimes[0] }));
    }
  }, [filteredTimes, form.time]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg('');
    try {
      await apiPost('/bookings', form);
      setMsg('Bokning bekräftad! Ett e-postmeddelande har skickats till dig.');
      setForm({
        date: defaultDate,
        time: '19:00',
        guests: '2',
        name: '',
        email: '',
        phone: '',
        notes: ''
      });
      setTimeout(() => setMsg(''), 7000);
    } catch {
      setMsg('Ett fel uppstod. Vänligen försök igen eller kontakta oss per telefon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[44vh] flex items-center justify-center overflow-hidden pt-28 pb-16 px-6 text-center">
        <img
          src="/images/reservations-hero.webp"
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          alt="Bordsbokning"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 sm:w-14 h-[1px] bg-gold/50" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gold font-bold">
              GASTRONOMISK UPPLEVELSE • BORDSBOKNING
            </span>
            <span className="w-8 sm:w-14 h-[1px] bg-gold/50" />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-wide leading-tight">
            Reservera Din Plats <span className="italic text-gold font-normal">bland Stjärnorna</span>
          </h1>

          <p className="mt-4 text-white/70 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Upplev en oförglömlig kväll där elden, de nordiska råvarorna och stillheten möts. Vi rekommenderar framförhållning för helger och avsmakningsmenyer i matsalen.
          </p>
        </div>
      </section>

      {/* Main Reservation Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] items-start">
          {/* Left Column: Multi-step Reservation Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d1218]/85 backdrop-blur-md p-6 sm:p-9 shadow-2xl">
            {msg && (
              <div
                className={`mb-6 flex items-center gap-3 p-4 rounded-xl text-sm ${
                  msg.includes('bekräftad')
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                <CheckCircle size={18} className="shrink-0" />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Antal gäster */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                    1. ANTAL GÄSTER
                  </span>
                  <span className="text-[12px] font-bold text-gold">
                    Valt: {form.guests} {Number(form.guests) === 1 ? 'person' : 'personer'}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isOverSeven = Number(form.guests) >= 7;
                    const isSelected = num === 7 ? isOverSeven : Number(form.guests) === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            guests: num === 7 ? (Number(prev.guests) >= 7 ? prev.guests : '8') : String(num)
                          }));
                        }}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? 'border-gold bg-gold/15 text-gold shadow-[0_0_12px_rgba(200,164,77,0.3)] font-bold'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {num === 7 ? '7+' : num}
                      </button>
                    );
                  })}
                </div>

                {/* Större sällskap notification & input */}
                {Number(form.guests) >= 7 && (
                  <div className="mt-3.5 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4 text-left space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-gold">
                        Större sällskap (&gt;7 personer): Ange exakt antal gäster
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="7"
                          max="20"
                          value={form.guests}
                          onChange={(e) => setForm((prev) => ({ ...prev, guests: e.target.value }))}
                          className="w-16 rounded-lg border border-gold/40 bg-black/60 px-2 py-1 text-center font-bold text-gold text-sm focus:border-gold outline-none"
                        />
                        <span className="text-xs text-white/50">personer</span>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/50">
                      Notera: Sällskap över 7 personer placeras i vår Chambre Séparée eller matsalslounge. För sällskap över 8 gäster gäller förbestämd meny för bästa upplevelse. Restaurangen kontaktar dig även för bekräftelse och menyval.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Välj datum */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                    2. VÄLJ DATUM
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Lediga bord finns
                  </span>
                </div>

                {/* Date Input with Calendar Icon */}
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                  />
                </div>

                {/* Quick Date Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
                  {quickDates.map((q) => {
                    const isSelected = form.date === q.dateStr;
                    return (
                      <button
                        key={q.dateStr}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, date: q.dateStr }))}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all duration-200 text-center truncate ${
                          isSelected
                            ? 'border-gold bg-gold/15 text-gold shadow-[0_0_10px_rgba(200,164,77,0.25)] font-bold'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>

                {isDayClosed && (
                  <p className="mt-2 text-xs font-semibold text-red-400">
                    Restaurangen är stängd hela dagen det valda datumet.
                  </p>
                )}
              </div>

              {/* 3. Sittning & Tid */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                    3. SITTNING &amp; TID
                  </span>
                  <span className="text-[12px] font-bold text-gold">
                    Vald tid: {form.time}
                  </span>
                </div>

                {/* Sittings Groups */}
                <div className="space-y-5">
                  {SITTINGS.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/50">
                          {group.title}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-gold/70 shrink-0">
                          {group.badge}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {group.slots.map((slot) => {
                          const isSelected = form.time === slot;
                          const isAvailable = filteredTimes.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                              className={`py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                                isSelected
                                  ? 'border-gold bg-gold/20 text-gold shadow-[0_0_10px_rgba(200,164,77,0.3)] font-bold'
                                  : isAvailable
                                    ? 'border-white/10 bg-white/[0.02] text-white/80 hover:border-gold/40 hover:text-gold'
                                    : 'border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Dina uppgifter */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 block">
                  4. DINA UPPGIFTER
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Fullständigt namn"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="E-postadress"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                  />
                </div>

                <input
                  type="tel"
                  placeholder="Telefonnummer"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                />

                <textarea
                  placeholder="Allergier, kostavvikelser eller speciella önskemål (valfritt)"
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || isDayClosed || filteredTimes.length === 0}
                  className="w-full mt-3 rounded-xl bg-gold py-3.5 sm:py-4 px-4 text-center font-bold text-[11px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#d4b56a] hover:shadow-[0_0_20px_rgba(200,164,77,0.4)] active:scale-[0.99] shadow-xl shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Bokar din plats...' : 'Bekräfta bordsreservation'}</span>
                  <span className="text-sm font-black leading-none shrink-0">→</span>
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-[10.5px] text-white/50 pt-1">
                  <ShieldCheck size={13} className="text-gold shrink-0" />
                  <span>Direktbekräftelse skickas kostnadsfritt via SMS &amp; e-post. Ingen depositionsavgift krävs.</span>
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Information Cards */}
          <div className="space-y-6">
            {/* Card 1: Öppettider */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1218]/85 backdrop-blur-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-2xl text-white">Öppettider</h3>
                {restaurantData?.nowStatus && (
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                      restaurantData.nowStatus.isOpen
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        restaurantData.nowStatus.isOpen ? 'animate-pulse bg-emerald-400' : 'bg-red-400'
                      }`}
                    />
                    {restaurantData.nowStatus.isOpen ? 'Öppet nu' : 'Stängt'}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                {WEEK_KEYS.map((key) => {
                  const oh = restaurantData?.week?.[key];
                  const dayName = DAY_MAP[key];

                  const todayKey = WEEK_KEYS[(new Date().getDay() + 6) % 7];
                  const isToday = key === todayKey;

                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between py-1.5 px-3 rounded-xl transition-all duration-200 text-[13px] ${
                        isToday
                          ? 'border border-gold/30 bg-gold/15 text-gold font-bold shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <span>{dayName}{isToday ? ' (Idag):' : ':'}</span>
                      {oh?.closed ? (
                        <span className="text-red-400/80 font-bold uppercase tracking-wider text-[11px]">Stängt</span>
                      ) : (
                        <span className="font-mono text-[12px]">{oh?.open || '11:00'} – {oh?.close || '22:00'}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 text-[11px] leading-relaxed text-white/40 pt-4 border-t border-white/5">
                Köket stänger 60 minuter innan restaurangens stängningstid samtliga dagar.
              </p>
            </div>

            {/* Card 2: Adress & Kontakt */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1218]/85 backdrop-blur-md p-6 shadow-xl space-y-5">
              <h3 className="font-display text-2xl text-white">Adress &amp; Kontakt</h3>

              {/* Location */}
              <div className="flex gap-3.5 group">
                <a
                  href="https://www.google.com/maps/place/Pizzeria+Venus/@59.2869414,15.1824878,17z/data=!3m1!4b1!4m6!3m5!1s0x465c152c1fd82447:0x43c6d995c0863e13!8m2!3d59.2869414!4d15.1799129!16s%2Fg%2F1yh9ttv40"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Öppna plats i Google Maps"
                  title="Öppna i Google Maps"
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:scale-105 shadow-sm"
                >
                  <MapPin size={18} className="text-gold transition-transform group-hover:scale-110" />
                </a>
                <div>
                  <p className="text-[13px] font-semibold text-white/95">Restaurang Venus</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">
                    Varbergagatan 39A, 703 51 Örebro<br />
                    Sverige
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Pizzeria+Venus/@59.2869414,15.1824878,17z/data=!3m1!4b1!4m6!3m5!1s0x465c152c1fd82447:0x43c6d995c0863e13!8m2!3d59.2869414!4d15.1799129!16s%2Fg%2F1yh9ttv40"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-[11px] font-medium text-gold hover:underline"
                  >
                    Hitta hit via Google Maps →
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-3.5 pt-3.5 border-t border-white/5 group">
                <a
                  href="tel:019257090"
                  aria-label="Ring restaurangen"
                  title="Ring 019 – 25 70 90"
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:scale-105 shadow-sm"
                >
                  <Phone size={18} className="text-gold transition-transform group-hover:scale-110" />
                </a>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">Telefonbokning &amp; Frågor</p>
                  <a
                    href="tel:019257090"
                    className="text-[14px] font-bold text-white hover:text-gold transition-colors block mt-0.5"
                  >
                    019 – 25 70 90
                  </a>
                  <p className="text-[11px] text-white/40 mt-0.5">Besvaras vardagar 10:00 – 16:00</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3.5 pt-3.5 border-t border-white/5 group">
                <a
                  href="mailto:info@venusrestaurant.se"
                  aria-label="Skicka e-post"
                  title="Skicka e-post till info@venusrestaurant.se"
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:scale-105 shadow-sm"
                >
                  <Mail size={18} className="text-gold transition-transform group-hover:scale-110" />
                </a>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">E-post</p>
                  <a
                    href="mailto:info@venusrestaurant.se"
                    className="text-[13.5px] font-bold text-white hover:text-gold transition-colors block mt-0.5"
                  >
                    info@venusrestaurant.se
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Bra att veta inför besöket */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1218]/85 backdrop-blur-md p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <Info size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  BRA ATT VETA INFÖR BESÖKET
                </span>
              </div>

              <ul className="space-y-3 text-[11.5px] leading-relaxed text-white/60 pt-2">
                <li className="flex gap-2">
                  <span className="text-gold shrink-0">•</span>
                  <span>
                    <strong className="text-white/90">Avbokning:</strong> Kostnadsfri avbokning senast 24 timmar innan utsatt tid via bekräftelselänken.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold shrink-0">•</span>
                  <span>
                    <strong className="text-white/90">Större sällskap (&gt;7 personer):</strong> Registreras direkt i bokningen med önskat antal gäster och sällskapsönskemål. Vid sällskap över 10 personer kontaktar vår hovmästare dig personligen inom 24 timmar för att skräddarsy meny, dryckespaket och bordsplacering i Chambre Séparée.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold shrink-0">•</span>
                  <span>
                    <strong className="text-white/90">Dresscode:</strong> Smart casual / diskret elegans.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Atmosphere / Experience Showcase Section - Full Width */}
      <section className="w-full border-t border-white/10 bg-gradient-to-b from-[#0c121a] via-[#0a0f16] to-[#070b10] py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left: Atmospheric Image (Large, subtle radius) */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl group bg-white/5">
                <img
                  src="/images/reservation-atmosphere.webp"
                  alt="Matsalen & Vinkällaren"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('reservation-atmosphere.png')) {
                      e.currentTarget.src = '/images/reservation-atmosphere.png';
                    }
                  }}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Right: Storytelling & Quote */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                ATMOSFÄREN
              </span>
              <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-snug">
                “En plats där gastronomi möter stillhet och intimitet i hjärtat av Örebro.”
              </blockquote>
              <p className="text-[13px] sm:text-sm text-white/60 font-light leading-relaxed">
                Oavsett om du firar livets milstolpar eller njuter av en stilla tisdagsmiddag i sällskap med hantverksviner från småskaliga producenter, skapar vi ett personligt lugn vid varje bord.
              </p>
              <div className="pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold hover:text-white transition-colors group"
                >
                  <span>UTFORSKA HELA VÅR MENY &amp; VINLISTA</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Reservations;

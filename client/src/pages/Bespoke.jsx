import { useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { Mail, Clock, Star, ShieldCheck } from 'lucide-react';
import { apiPost } from '../lib/api';

const Bespoke = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    eventType: 'Privat Middag',
    guests: '',
    preferredDate: '',
    budgetRange: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiPost('/inquiries', form);
      setToast('Tack! Vi har tagit emot din förfrågan och kontaktar dig inom 24 timmar.');
      setForm({
        fullName: '',
        email: '',
        eventType: 'Privat Middag',
        guests: '',
        preferredDate: '',
        budgetRange: '',
        message: ''
      });
    } catch {
      setToast('Ett fel uppstod. Vänligen kontakta oss via e-post istället.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/bespoke-room.png" className="w-full h-full object-cover opacity-40" alt="Bespoke Hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        </div>
        <div className="relative z-10 text-center px-8 sm:px-12">
          <p className="text-gold uppercase tracking-[0.6em] text-[13px] sm:text-base mb-4 font-bold">Exklusivitet & Elegans</p>
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl mb-6">Skräddarsytt</h1>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Vi skapar oförglömliga upplevelser designade exakt efter dina önskemål. 
            Från privata middagar till exklusiva företagsevenemang.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="group relative border border-white/5 bg-panel/20 overflow-hidden hover:border-gold/30 transition-all duration-500">
            <div className="aspect-video overflow-hidden">
              <img src="/images/about-chef.png" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" alt="Kock i hemmet" loading="lazy" />
            </div>
            <div className="p-10 space-y-3">
              <h3 className="font-display text-3xl text-gold">Kocken i Hemmet</h3>
              <p className="text-white/55 text-sm">Ta med Venus hem till dig med en fullservicerad privat middagsupplevelse.</p>
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">Från 2 200 SEK per person   Minst 6 gäster</p>
            </div>
          </div>
          <div className="group relative border border-white/5 bg-panel/20 overflow-hidden hover:border-gold/30 transition-all duration-500">
            <div className="aspect-video overflow-hidden">
              <img src="/images/bespoke-menu.png" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" alt="Menycurering" loading="lazy" />
            </div>
            <div className="p-10 space-y-3">
              <h3 className="font-display text-3xl text-gold">Gastronomisk Design</h3>
              <p className="text-white/55 text-sm">Personlig konsultation med vår kock för en meny designad helt efter dig.</p>
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">Från 1 500 SEK per person   Minst 6 gäster</p>
            </div>
          </div>
        </div>
        <div className="mt-14 text-center">
          <p className="text-white/65 mb-5">Redo att planera din upplevelse?</p>
          <a href="#inquiry" className="inline-flex items-center justify-center border border-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-black rounded-full hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto">
            Begär Konsultation
          </a>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-panel/40 py-24 lg:py-32 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-8 sm:px-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-gold"><Clock size={24} /></div>
              <h4 className="font-display text-xl md:text-2xl uppercase tracking-wider">1. Konsultation</h4>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">Berätta för oss om din vision och dina preferenser.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-gold"><Star size={24} /></div>
              <h4 className="font-display text-xl md:text-2xl uppercase tracking-wider">2. Design</h4>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">Få ett skräddarsytt förslag inklusive meny och atmosfärsplan.</p>
            </div>
            <div className="space-y-6 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-gold"><ShieldCheck size={24} /></div>
              <h4 className="font-display text-xl md:text-2xl uppercase tracking-wider">3. Genomförande</h4>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">Vi levererar med precision och professionell diskretion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-24 lg:py-40">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-20">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl mb-8 leading-tight">Börja Resan</h2>
            <p className="text-white/60 mb-10 leading-relaxed">Berätta om ditt evenemang. Vårt team kontaktar dig inom 24 timmar.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-white/40"><Mail className="text-gold" size={18} />events@restaurangvenus.se</div>
              <div className="flex items-center gap-4 text-sm text-white/40"><ShieldCheck className="text-gold" size={18} />Garanterad sekretess</div>
            </div>
          </div>
          <div className="bg-panel border border-white/10 p-6 sm:p-8">
            {toast && <p className={`mb-6 border px-4 py-3 text-sm ${toast.includes('Tack') ? 'border-gold/40 bg-gold/10 text-gold' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}>{toast}</p>}
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Fullständigt namn</label>
                <input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} type="text" className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" placeholder="Ditt namn" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">E-postadress</label>
                <input value={form.email} onChange={(e) => updateField('email', e.target.value)} type="email" className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" placeholder="email@exempel.se" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Typ av evenemang</label>
                <select value={form.eventType} onChange={(e) => updateField('eventType', e.target.value)} className="w-full border-b border-white/10 bg-transparent py-1.5 text-white/70 focus:border-gold outline-none transition-colors appearance-none">
                  <option>Privat Middag</option>
                  <option>Företagsevenemang</option>
                  <option>Kock i hemmet</option>
                  <option>Skräddarsydd meny</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Uppskattat antal gäster</label>
                <input value={form.guests} onChange={(e) => updateField('guests', e.target.value)} type="number" className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" placeholder="t.ex. 12" min="1" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Önskat datum</label>
                <input value={form.preferredDate} onChange={(e) => updateField('preferredDate', e.target.value)} type="date" min={new Date().toISOString().split('T')[0]} className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Budget (valfritt)</label>
                <input value={form.budgetRange} onChange={(e) => updateField('budgetRange', e.target.value)} type="text" className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" placeholder="t.ex. 20 000 - 35 000 KR" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Meddelande / Vision</label>
                <textarea value={form.message} onChange={(e) => updateField('message', e.target.value)} rows="3" className="w-full border-b border-white/10 bg-transparent py-1.5 text-white focus:border-gold outline-none transition-colors" placeholder="Beskriv tillfället..." required></textarea>
              </div>
              <div className="sm:col-span-2 pt-3 flex justify-start">
                <button 
                  disabled={isSubmitting} 
                  className="w-full sm:w-fit rounded-full bg-gold px-10 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black hover:bg-goldSoft hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? 'Bearbetar...' : 'Skicka förfrågan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Bespoke;

import { Link } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { Quote } from 'lucide-react';

const About = () => {
  return (
    <main className="min-h-screen bg-background text-white selection:bg-gold/30">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative h-[68svh] min-[1025px]:h-screen max-h-[760px] min-[1025px]:max-h-none flex items-center justify-center overflow-hidden">
        <img 
          src="/images/story-interior.png" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" 
          alt="Restaurang Venus interiör" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <p className="mb-8 text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold">Örebro — Sedan 1994</p>
          <h1 className="font-display text-4xl sm:text-5xl min-[993px]:text-7xl xl:text-9xl text-white mb-10 leading-none">Vår Historia</h1>
          <p className="text-white/60 text-lg sm:text-xl leading-relaxed tracking-wide font-light max-w-2xl mx-auto">
            En resa genom smak, tid och den uråldriga konsten att tämja elden.
          </p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-16 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* The Heritage - Arvet */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-24 md:py-32 grid min-[993px]:grid-cols-12 gap-8 min-[993px]:gap-12 items-start">
        <div className="relative min-[993px]:col-span-6">
          <div className="absolute -left-6 -top-6 bottom-6 right-6 border border-gold/10" />
          <img src="/images/about-heritage.png" className="relative z-10 w-full aspect-[4/3] sm:aspect-[16/10] min-[993px]:aspect-[4/3] object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 shadow-2xl" alt="Venus 1994" />
          <div className="absolute right-4 bottom-4 bg-[#0b1118]/92 backdrop-blur-md px-6 py-4 border border-gold/30 shadow-2xl hidden sm:block z-20 rounded-sm">
            <p className="font-display text-4xl leading-none text-gold">1994</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/75">Etableringen</p>
          </div>
        </div>
        <div className="space-y-8 min-[993px]:col-span-6 min-[993px]:pl-4">
          <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-6">Arvet</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-4xl min-[993px]:text-5xl leading-tight">Där allting började</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            Venus föddes ur en vision om att återinföra råheten i det moderna köket. Det som började i hjärtat av Varberga har under tre decennier vuxit till en av Örebros mest ikoniska gastronomiska destinationer.
          </p>
          <p className="text-white/70 leading-relaxed text-lg">
            Vår grundare, en visionär med rötter i både det nordiska hantverket och den japanska precisionen, skapade en plats där gästen inte bara äter, utan blir en del av en ritual.
          </p>
        </div>
      </section>

      {/* The Philosophy - Elden */}
      <section className="bg-panel/20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-24 md:py-32 grid min-[993px]:grid-cols-12 gap-8 min-[993px]:gap-12 items-start">
          <div className="order-2 min-[993px]:order-1 space-y-8 min-[993px]:col-span-6 min-[993px]:pr-4">
            <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-6">Filosofin</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-4xl min-[993px]:text-5xl leading-tight">Elden som ingrediens</h2>
            <p className="text-white/70 leading-relaxed text-lg">
              Vi betraktar elden som vår viktigaste medarbetare. Vår specialbyggda grill, där vi använder uteslutande binchotan-kol och ekved, ger varje råvara en unik karaktär som varken gas eller elektricitet kan återskapa.
            </p>
            <div className="flex items-center gap-6 pt-6">
              <div className="h-px w-16 bg-gold/40" />
              <p className="text-sm italic text-white/50 tracking-wide">Tid, Temperatur, Textur.</p>
            </div>
          </div>
          <div className="order-1 min-[993px]:order-2 relative min-[993px]:col-span-6">
            <div className="absolute -right-6 -top-6 bottom-6 left-6 border border-gold/10" />
            <img src="/images/grill-fire.png" className="relative z-10 w-full aspect-[4/3] sm:aspect-[16/10] min-[993px]:aspect-square object-cover shadow-2xl" alt="The Fire" />
          </div>
        </div>
      </section>

      {/* The Craft - Hantverket */}
      <section className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-32 lg:py-48">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-6">Hantverket</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-4xl min-[993px]:text-5xl leading-tight mb-8">Precision i varje detalj</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Från val av råvara till den sista touchen vid bordet — ingenting lämnas åt slumpen. Vi samarbetar med lokala bönder som delar vår passion för hållbarhet och smak.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <img src="/images/about-chef.png" className="w-full aspect-[3/4] object-cover border border-white/5 grayscale hover:grayscale-0 transition-all duration-700" alt="Kock" />
            <h3 className="font-display text-3xl">Köket</h3>
            <p className="text-white/50 text-sm leading-relaxed">Ett team av hantverkare som förstår råvarans själ och eldens kraft.</p>
          </div>
          <div className="space-y-6 md:pt-24">
            <img src="/images/about-cellar.png" className="w-full aspect-[3/4] object-cover border border-white/5 grayscale hover:grayscale-0 transition-all duration-700" alt="Vinkällare" />
            <h3 className="font-display text-3xl">Källaren</h3>
            <p className="text-white/50 text-sm leading-relaxed">En samling av världens främsta viner, kuraterade för att lyfta varje tugga.</p>
          </div>
          <div className="space-y-6">
            <img src="/images/reservations-hero.png" className="w-full aspect-[3/4] object-cover border border-white/5 grayscale hover:grayscale-0 transition-all duration-700" alt="Atmosfär" />
            <h3 className="font-display text-3xl">Atmosfären</h3>
            <p className="text-white/50 text-sm leading-relaxed">En intim miljö där varje ljus och skugga är noga planerad.</p>
          </div>
        </div>
      </section>

      {/* The Visionary Quote */}
      <section className="bg-panel relative py-32 lg:py-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/story-interior.png')] bg-cover bg-fixed grayscale" />
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <Quote className="mx-auto text-gold/30 mb-12" size={64} />
          <h2 className="font-display text-3xl sm:text-4xl min-[993px]:text-6xl text-white leading-tight italic">
            "Vi vill inte bara mätta en hunger, vi vill väcka ett sinne."
          </h2>
          <div className="mt-12 h-px w-24 bg-gold/40 mx-auto" />
          <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-gold/60">Executive Chef & Grundare</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-32 px-8 sm:px-12 lg:px-16 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-4xl border border-gold/20 p-12 sm:p-24 text-center backdrop-blur-sm">
          <div className="absolute -inset-2 border border-gold/5 pointer-events-none" />
          <h2 className="font-display text-2xl min-[481px]:text-3xl md:text-5xl lg:text-6xl text-white mb-12 leading-tight">Bli en del av vår historia</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/reservations" className="min-w-[240px] bg-gold px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10">
              Boka bord
            </Link>
            <Link to="/menu" className="min-w-[240px] border border-gold px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-black transition-all">
              Se menyn
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;

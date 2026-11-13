import { Link } from 'react-router-dom';
import { UtensilsCrossed, Calendar, Leaf, Flame, MapPin } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col justify-start min-h-[610px] sm:min-h-[620px] md:min-h-[660px] lg:min-h-[700px] overflow-hidden bg-[#070b10] pt-4 sm:pt-6 pb-8 sm:pb-12">
      {/* Cinematic Solid Background */}
      <div className="absolute inset-0 z-0 bg-[#070b10]">
        <img
          src="/images/home-hero.jpg"
          alt="Venus Gastronomi"
          fetchPriority="high"
          className="h-full w-full object-cover object-center opacity-90 md:opacity-95"
        />
        {/* Subtle, clear gradient: crisp visibility on the dish, seamless contrast for typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#070b10] pointer-events-none" />
      </div>

      {/* Hero Content - Kept gracefully pushed down below the header and opening hours */}
      <div className="relative z-10 pt-14 sm:pt-16 md:pt-20 lg:pt-24 px-4 text-center sm:px-8 max-w-4xl w-full mx-auto flex flex-col items-center">
        {/* Top decorative line and badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 -mt-2 sm:mt-0 mb-3.5 sm:mb-3 animate-[fade-in-down_1s_ease-out]">
          <span className="w-5 sm:w-14 h-[1px] bg-gold/50" />
          <span className="text-[8.5px] sm:text-[10.5px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-gold font-bold">
            KULINARISK UPPLEVELSE I ÖREBRO
          </span>
          <span className="w-5 sm:w-14 h-[1px] bg-gold/50" />
        </div>
        
        {/* Main Title - Prominent luxury typography on all devices */}
        <h1 className="font-display text-[27px] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.14] text-white font-light tracking-wide mt-1.5 sm:mt-0 mb-2.5 sm:mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-[fade-in-up_1s_ease-out_0.2s_both]">
          Modern Gastronomi <br />
          <span className="italic text-gold font-normal">med Nordiska Råvaror</span>
        </h1>

        {/* Subtitle / Description - Full text visible without truncation dots */}
        <p className="max-w-2xl text-[13px] sm:text-[15px] md:text-base text-white/90 font-light leading-relaxed mb-3 sm:mb-5 px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-[fade-in-up_1s_ease-out_0.35s_both]">
          Vällagade rätter, utvalda råvaror och en atmosfär som ger dig en oförglömlig smakupplevelse — mitt i hjärtat av Örebro. En hyllning till hantverket med råvaror från traktens producenter.
        </p>

        {/* Action Buttons - Pushed down onto the puree below the salmon on mobile */}
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-auto mx-auto mt-28 sm:mt-14 md:mt-16 lg:mt-18 mb-2 animate-[fade-in-up_1s_ease-out_0.5s_both]">
          {/* Button 1: Beställ Nu */}
          <Link 
            to="/menu" 
            className="rounded-full border border-gold bg-gold hover:bg-[#d4b56a] px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-gold/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <UtensilsCrossed size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={2.2} />
            <span>Beställ nu</span>
          </Link>
          
          {/* Button 2: Boka Bord */}
          <Link 
            to="/reservations"
            className="rounded-full border border-gold/50 bg-black/80 hover:bg-black hover:border-gold px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white hover:text-gold transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md shadow-xl flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-gold" strokeWidth={2.2} />
            <span>Boka bord</span>
          </Link>
        </div>
      </div>

      {/* 3 Info Highlights Row - Perfectly positioned on the plate rim */}
      <div className="relative z-10 mt-10 sm:mt-12 md:mt-14 lg:mt-16 hidden sm:flex flex-row items-center justify-center gap-3 sm:gap-3.5 lg:gap-4 w-full max-w-2xl mx-auto px-4 animate-[fade-in-up_1s_ease-out_0.65s_both]">
        {/* Feature 1 */}
        <div className="group flex-1 max-w-[220px] flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-gold/40 backdrop-blur-md px-3.5 py-2 sm:py-2.5 transition-all duration-300 shadow-xl shadow-black/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/25 text-gold group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
            <Leaf size={15} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-white group-hover:text-gold transition-colors duration-300 whitespace-nowrap">Färska Råvaror</p>
            <p className="text-[9.5px] sm:text-[10px] text-white/55 font-light mt-0.5 whitespace-nowrap">Lokalt & säsongsbetonat</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="group flex-1 max-w-[220px] flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-gold/40 backdrop-blur-md px-3.5 py-2 sm:py-2.5 transition-all duration-300 shadow-xl shadow-black/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/25 text-gold group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
            <Flame size={15} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-white group-hover:text-gold transition-colors duration-300 whitespace-nowrap">Passion i Köket</p>
            <p className="text-[9.5px] sm:text-[10px] text-white/55 font-light mt-0.5 whitespace-nowrap">Konstfullt hantverk</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="group flex-1 max-w-[220px] flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-gold/40 backdrop-blur-md px-3.5 py-2 sm:py-2.5 transition-all duration-300 shadow-xl shadow-black/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/25 text-gold group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
            <MapPin size={15} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-white group-hover:text-gold transition-colors duration-300 whitespace-nowrap">Örebro</p>
            <p className="text-[9.5px] sm:text-[10px] text-white/55 font-light mt-0.5 whitespace-nowrap">Varbergagatan 39A</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
};

export default HeroSection;
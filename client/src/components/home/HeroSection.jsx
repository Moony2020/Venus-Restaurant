import { Link } from 'react-router-dom';
import { UtensilsCrossed, Calendar, Leaf, Flame, MapPin } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col justify-between min-h-[440px] sm:min-h-[520px] md:min-h-[560px] lg:min-h-[600px] xl:min-h-[640px] overflow-hidden bg-[#070b10] pt-2 sm:pt-5 md:pt-6 pb-0 sm:pb-4">
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

      {/* Hero Content - Cleanly clear of opening hours dropdown on mobile, centered on desktop */}
      <div className="relative z-10 pt-11 sm:pt-0 sm:my-auto px-4 text-center sm:px-8 max-w-4xl w-full mx-auto flex flex-col items-center">
        {/* Top decorative line and badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 -mt-2 sm:mt-0 mb-2.5 sm:mb-3 animate-[fade-in-down_1s_ease-out]">
          <span className="w-5 sm:w-14 h-[1px] bg-gold/50" />
          <span className="text-[8.5px] sm:text-[10.5px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-gold font-bold">
            KULINARISK UPPLEVELSE I ÖREBRO
          </span>
          <span className="w-5 sm:w-14 h-[1px] bg-gold/50" />
        </div>
        
        {/* Main Title */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.12] text-white font-light tracking-wide mb-2 sm:mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-[fade-in-up_1s_ease-out_0.2s_both]">
          Modern Gastronomi <br />
          <span className="italic text-gold font-normal">med Nordiska Råvaror</span>
        </h1>

        {/* Subtitle / Description */}
        <p className="max-w-2xl text-[11px] sm:text-xs md:text-sm text-white/85 font-light leading-relaxed mb-2 sm:mb-5 px-2 line-clamp-2 sm:line-clamp-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-[fade-in-up_1s_ease-out_0.35s_both]">
          Vällagade rätter, utvalda råvaror och en atmosfär som ger dig en oförglömlig smakupplevelse — mitt i hjärtat av Örebro. En hyllning till hantverket med råvaror från traktens producenter.
        </p>

        {/* Action Buttons - Pushed down onto the puree below the salmon */}
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-auto mx-auto mt-20 sm:mt-16 md:mt-20 lg:mt-24 mb-2 animate-[fade-in-up_1s_ease-out_0.5s_both]">
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

      {/* 3 Info Highlights Row - Cleanly anchored at the bottom edge */}
      <div className="relative z-10 mt-auto hidden sm:grid sm:grid-cols-3 gap-6 lg:gap-10 pt-3 sm:pt-4 border-t border-white/10 w-full max-w-3xl mx-auto px-4 animate-[fade-in-up_1s_ease-out_0.65s_both]">
        {/* Feature 1 */}
        <div className="flex items-center justify-start gap-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 text-gold">
            <Leaf size={15} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white">Färska Råvaror</p>
            <p className="text-[10px] text-white/50">Lokalt & säsongsbetonat</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-center justify-start gap-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 text-gold">
            <Flame size={15} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white">Passion i Köket</p>
            <p className="text-[10px] text-white/50">Konstfullt hantverk</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-center justify-start gap-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 text-gold">
            <MapPin size={15} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white">Örebro</p>
            <p className="text-[10px] text-white/50">Varbergagatan 39A</p>
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
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative flex h-[100svh] max-h-[800px] sm:max-h-none sm:min-h-screen items-center justify-center overflow-hidden">
      {/* Cinematic Parallax Background */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out scale-110"
        style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.05)` }}
      >
        <img 
          src="/images/hero-steak.png" 
          alt="Steak hero" 
          className="h-full w-full object-cover" 
          loading="eager" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-background" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-8 text-center sm:px-12 max-w-7xl w-full">
        <div className="overflow-hidden">
          <p className="mb-8 text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold animate-[fade-in-down_1.2s_ease-out]">
            Välkommen till Venus
          </p>
        </div>
        
        <h1 className="mx-auto mb-10 max-w-5xl font-display text-3xl leading-tight text-white sm:text-5xl md:text-7xl lg:text-8xl animate-[fade-in-up_1s_ease-out_0.2s_both]">
          Äkta smaker.<br />
          <span className="text-white/90">Äkta upplevelser.</span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-[fade-in-up_1s_ease-out_0.5s_both]">
          <Link 
            to="/menu" 
            className="group relative min-w-[240px] bg-gold px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-black transition-all hover:bg-goldSoft shadow-2xl shadow-gold/20"
          >
            Beställ nu
            <div className="absolute inset-0 border border-gold scale-100 group-hover:scale-105 transition-transform duration-300" />
          </Link>
          
          <Link 
            to="/menu" 
            className="min-w-[240px] border border-white/20 bg-white/5 backdrop-blur-md px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white transition-all hover:border-gold hover:text-gold"
          >
            Utforska menyn
          </Link>
        </div>
      </div>

      {/* Cinematic Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[9px] uppercase tracking-[0.4em] text-white font-medium">Scroll</span>
        <div className="h-16 w-px bg-gradient-to-b from-gold to-transparent" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
};

export default HeroSection;

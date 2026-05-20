import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative flex h-[38svh] min-h-[310px] sm:h-[48svh] sm:min-h-[420px] lg:h-[70svh] lg:min-h-[560px] xl:h-[78svh] xl:min-h-[640px] max-h-[780px] items-center justify-center overflow-hidden bg-background">
      {/* Cinematic Parallax Background (Unified landscape scaling to completely eliminate side crop) */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out bg-background"
        style={{ 
          transform: windowWidth < 1024 ? 'none' : `translateY(${scrollY * 0.08}px) scale(1.03)`,
        }}
      >
        <img
          src="/images/home-steak.jpg"
          alt="Venus hero"
          className="h-full w-full object-cover object-center"
        />
        {/* Luxury gradient mask overlays for high typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-background" />
      </div>

      {/* Hero Content Overlaid directly on the image */}
      <div className="relative z-10 px-8 text-center sm:px-12 max-w-7xl w-full">
        {/* Shifting text elements upward to clear visual center */}
        <div className="transform -translate-y-4 sm:-translate-y-6 md:-translate-y-8 lg:-translate-y-16">
          <div className="overflow-hidden">
            <p className="mb-3 sm:mb-4 text-[9px] sm:text-xs md:text-sm uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gold font-bold animate-[fade-in-down_1.2s_ease-out]">
              Kockens Val - Populära
            </p>
          </div>
          
          <h1 className="mx-auto mb-3 sm:mb-4 max-w-5xl font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight text-white animate-[fade-in-up_1s_ease-out_0.2s_both]">
            Utforska Smakernas Galax
          </h1>

          <p className="mx-auto mb-10 sm:mb-12 md:mb-14 lg:mb-20 max-w-2xl text-[10px] sm:text-[13px] md:text-sm text-white/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium leading-relaxed animate-[fade-in-up_1s_ease-out_0.4s_both]">
            Venus ger en brutal gastronomisk upplevelse i Örebro
          </p>
        </div>

        {/* Smaller, centered buttons that don't block the food dish */}
        <div className="flex flex-col min-[480px]:flex-row items-center justify-center gap-3 sm:gap-4 w-full transform translate-y-2 sm:translate-y-4 lg:translate-y-0 animate-[fade-in-up_1s_ease-out_0.5s_both]">
          <Link 
            to="/menu" 
            className="w-[220px] rounded-full bg-gold px-6 py-2.5 sm:px-8 sm:py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-goldSoft hover:scale-105 active:scale-95 shadow-xl shadow-gold/25 flex items-center justify-center"
          >
            Beställ nu
          </Link>
          
          <button 
            onClick={() => {
              const el = document.getElementById('featured-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.location.href = '/menu';
              }
            }}
            className="w-[220px] rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-6 py-2.5 sm:px-8 sm:py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-gold hover:text-gold hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            Utforska menyn
          </button>
        </div>
      </div>

      {/* Cinematic Scroll Indicator (Visible on tablet & desktop screens) */}
      <div className="hidden sm:flex absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 sm:gap-3 opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] text-white font-medium">Scroll</span>
        <div className="h-6 sm:h-12 w-px bg-gradient-to-b from-gold to-transparent" />
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

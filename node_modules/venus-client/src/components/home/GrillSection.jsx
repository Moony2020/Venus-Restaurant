const GrillSection = () => (
  <section className="bg-panel/40 border-y border-white/5">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 py-24 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-32">
      <div className="order-2 md:order-1">
        <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-gold/80 font-medium">Hantverk & Eld</p>
        <h2 className="mb-8 font-display text-5xl leading-tight text-white sm:text-6xl">Grillsektionen</h2>
        <p className="max-w-md text-base leading-relaxed text-white/70">
          Vår stolthet ligger i den öppna lågan. Vi använder unika tekniker och björkeved för att ge våra råvaror den karakteristiska rökigheten som bara äkta grillning kan uppnå. Se kockarnas precision när de tämjer elden för att skapa perfektion.
        </p>
        
        <div className="mt-12 flex gap-12">
          <div>
            <p className="font-display text-5xl text-gold mb-1">850°</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Maillard effekt</p>
          </div>
          <div>
            <p className="font-display text-5xl text-gold mb-1">12h</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Träkolsförberedelse</p>
          </div>
        </div>
      </div>
      
      <div className="relative order-1 md:order-2">
        <img 
          src="/images/grill-fire.png" 
          alt="Grillsektionen" 
          className="aspect-[4/3] w-full object-cover shadow-premium rounded-sm" 
          loading="lazy" 
        />
        <div className="absolute -bottom-6 -left-6 md:-left-12 bg-background border border-white/10 px-8 py-6 shadow-2xl">
          <p className="font-display text-2xl italic text-white/90 sm:text-3xl leading-snug">
            "Elden är vår viktigaste ingrediens."
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default GrillSection;

import { Link } from 'react-router-dom';

const StorySection = () => (
  <section className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 py-24 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-32">
    <div className="relative">
      <div className="absolute -left-4 -top-4 bottom-4 right-4 border border-gold/30" />
      <img 
        src="/images/story-interior.png" 
        alt="Vår historia" 
        className="relative z-10 aspect-[4/5] w-full object-cover shadow-2xl" 
        loading="lazy" 
      />
    </div>
    <div className="md:pl-12">
      <p className="mb-6 text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold">Örebro — Sedan 1994</p>
      <h2 className="mb-8 font-display text-5xl leading-tight text-white sm:text-6xl">Vår Historia</h2>
      <p className="mb-6 max-w-xl text-base leading-relaxed text-white/70">
        Venus föddes ur en vision om att kombinera den kosmiska mystiken med Örebros lokala råvaror. I hjärtat av vår restaurang finner du en miljö som andas lugn och exklusivitet, där varje detalj är noga utvald för att skapa en helhetsupplevelse utöver det vanliga.
      </p>
      <p className="mb-10 max-w-xl text-base italic leading-relaxed text-white/50">
        "Vår passion för gastronomi är drivkraften bakom varje rätt vi skapar, serverad med passion och precision."
      </p>
      <Link to="/menu" className="group flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold transition hover:text-goldSoft">
        Läs mer om oss
        <span className="block h-[1px] w-8 bg-gold transition-all group-hover:w-12 group-hover:bg-goldSoft" />
      </Link>
    </div>
  </section>
);

export default StorySection;

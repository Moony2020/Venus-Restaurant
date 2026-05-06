const ReservationSection = () => (
  <section className="bg-background py-32 px-6">
    <div className="mx-auto max-w-4xl border border-gold/15 bg-panel/30 p-12 sm:p-20 text-center">
      <p className="text-[13px] sm:text-base uppercase tracking-[0.6em] text-gold font-bold mb-8">Bordsbokning</p>
      <h2 className="font-display text-5xl sm:text-7xl mb-12 text-white">Säkra din upplevelse</h2>
      
      <form className="grid sm:grid-cols-3 gap-8 text-left">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Datum</label>
          <input 
            type="date" 
            className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none" 
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Antal</label>
          <select className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none appearance-none">
            <option>2 Personer</option>
            <option>4 Personer</option>
            <option>6 Personer</option>
            <option>Fler än 6</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 ml-1">Tid</label>
          <input 
            type="time" 
            className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white focus:border-gold/50 transition-colors outline-none" 
          />
        </div>
      </form>
      
      <button className="mt-16 min-w-[240px] border border-gold bg-transparent px-10 py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black">
        Bekräfta bokning
      </button>
    </div>
  </section>
);

export default ReservationSection;

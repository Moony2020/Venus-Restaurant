const PageLoader = () => (
  <main className="flex min-h-screen items-center justify-center bg-background text-white overflow-hidden">
    <div className="relative flex flex-col items-center">
      {/* Cinematic Logo Reveal */}
      <h1 className="font-display text-5xl sm:text-7xl tracking-[0.4em] text-gold animate-pulse opacity-0 [animation:fade-in-out_2s_ease-in-out_infinite]">
        VENUS
      </h1>
      
      {/* Subtle Progress Bar */}
      <div className="mt-8 h-[1px] w-32 bg-white/10 overflow-hidden">
        <div className="h-full bg-gold/50 animate-[loading-progress_2s_ease-in-out_infinite]" />
      </div>
    </div>

    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes fade-in-out {
        0%, 100% { opacity: 0; transform: scale(0.98); letter-spacing: 0.3em; }
        50% { opacity: 1; transform: scale(1); letter-spacing: 0.5em; }
      }
      @keyframes loading-progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}} />
  </main>
);

export default PageLoader;

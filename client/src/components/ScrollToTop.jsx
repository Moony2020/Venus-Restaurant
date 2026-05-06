import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-[150] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-75 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-gold hover:text-black hover:scale-110 active:scale-95 group"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </div>
  );
};

export default ScrollToTop;

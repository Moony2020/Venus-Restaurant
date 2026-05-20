import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';

const linksDesktop = [
  { label: 'Meny', path: '/menu' },
  { label: 'Upplevelsen', path: '/about' },
  { label: 'Bokningar', path: '/reservations' },
  { label: 'Skräddarsytt', path: '/bespoke' }
];

const linksMobile = [
  { label: 'Vår Meny', path: '/menu' },
  { label: 'Upplevelsen', path: '/about' },
  { label: 'Bokningar', path: '/reservations' },
  { label: 'Skräddarsytt', path: '/bespoke' },
  { label: 'Mitt Konto', path: '/account' }
];

const SiteHeader = () => {
  const { count } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [navIndicatorStyle, setNavIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef(null);
  const navTabRefs = useRef({});

  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = linksDesktop.find(link => 
        location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
      );
      if (activeLink) {
        const activeEl = navTabRefs.current[activeLink.path];
        if (activeEl) {
          const extraWidth = window.innerWidth < 1024 ? 12 : 8;
          setNavIndicatorStyle({
            left: activeEl.offsetLeft - (extraWidth / 2),
            width: activeEl.offsetWidth + extraWidth,
            opacity: 1
          });
          return;
        }
      }
      setNavIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    };

    updateIndicator();
    const id1 = setTimeout(updateIndicator, 50);
    const id2 = setTimeout(updateIndicator, 150);

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-gold/15 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[2200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-2xl lg:text-3xl tracking-[0.2em] lg:tracking-[0.3em] text-gold transition-colors hover:text-goldSoft">
            VENUS
          </Link>

          <nav ref={navContainerRef} className="relative hidden items-center gap-1.5 lg:gap-2.5 text-[10px] lg:text-[11px] uppercase tracking-[0.2em] lg:tracking-[0.25em] text-white/60 md:flex">
            {/* Sliding Glassy Gold Capsule Overlay */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-gold/10 border border-gold/30 shadow-[0_0_15px_rgba(200,164,77,0.15)] transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.25,1)] pointer-events-none"
              style={{
                left: `${navIndicatorStyle.left}px`,
                width: `${navIndicatorStyle.width}px`,
                opacity: navIndicatorStyle.opacity
              }}
            />

            {linksDesktop.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  ref={(el) => {
                    if (el) navTabRefs.current[link.path] = el;
                  }}
                  to={link.path}
                  className={`relative z-10 px-2.5 lg:px-3.5 py-1.5 rounded-full transition-colors duration-500 ${
                    isActive ? 'text-gold font-medium' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
            <Link to="/cart" className="group relative p-2 text-white/80 transition-colors hover:text-gold">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-black ring-2 ring-black">
                  {count}
                </span>
              )}
            </Link>

            <Link to="/account" className="p-2 text-white/80 transition-colors hover:text-gold">
              <User size={20} strokeWidth={1.5} />
            </Link>

            <Link
              to="/reservations"
              className="hidden rounded-lg border border-gold/40 p-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-black md:flex md:items-center md:justify-center md:p-1.5 lg:px-6 lg:py-2.5"
            >
              <span className="hidden lg:inline">Boka bord</span>
              <span className="hidden md:inline lg:hidden">
                <Calendar size={16} strokeWidth={1.5} />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-white/80 transition-colors hover:text-gold md:hidden"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[300] bg-black/30 transition-opacity duration-300 ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[301] h-full w-[85%] max-w-sm overflow-y-auto border-l border-white/10 bg-[#05090e] shadow-2xl transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <span className="font-display text-xl tracking-[0.2em] text-gold sm:text-2xl">VENUS</span>
            <button type="button" onClick={() => setIsMenuOpen(false)} className="p-2 text-white/40 hover:text-gold">
              <X size={28} strokeWidth={1} />
            </button>
          </div>

          <nav className="flex flex-col gap-3 sm:gap-4">
            {linksMobile.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link key={link.path} to={link.path} className="group flex items-center justify-between">
                  <span className={`font-display text-[24px] leading-[1.1] transition-colors sm:text-[28px] ${isActive ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                    {link.label}
                  </span>
                  <div className={`h-[1px] bg-gold/50 transition-all duration-300 ${isActive ? 'w-8' : 'w-0 group-hover:w-8'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/5 pt-4 sm:pt-5">
            <Link
              to="/reservations"
              className="block w-full bg-gold py-4 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:bg-goldSoft"
            >
              Boka bord
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SiteHeader;

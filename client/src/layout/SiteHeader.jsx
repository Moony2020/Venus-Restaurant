import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const linksDesktop = [
  { label: 'Upplevelsen', path: '/about' },
  { label: 'Meny', path: '/menu' },
  { label: 'Bokningar', path: '/reservations' },
  { label: 'Skräddarsytt', path: '/bespoke' }
];

const linksMobile = [
  { label: 'Upplevelsen', path: '/about' },
  { label: 'Vår Meny', path: '/menu' },
  { label: 'Bokningar', path: '/reservations' },
  { label: 'Skräddarsytt', path: '/bespoke' },
  { label: 'Mitt Konto', path: '/account' }
];

const SiteHeader = () => {
  const { count } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
        <div className="mx-auto flex h-20 w-[92vw] max-w-[2200px] items-center justify-between px-6 lg:px-8">
          <Link to="/" className="font-display text-3xl tracking-[0.3em] text-gold transition-colors hover:text-goldSoft">
            VENUS
          </Link>

          <nav className="hidden items-center gap-10 text-[11px] uppercase tracking-[0.25em] text-white/60 md:flex">
            {linksDesktop.map((link) => (
              <Link key={link.path} to={link.path} className="nav-link transition-colors hover:text-gold">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
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
              className="ml-2 hidden border border-gold/40 px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-black lg:block"
            >
              Boka bord
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
            {linksMobile.map((link) => (
              <Link key={link.path} to={link.path} className="group flex items-center justify-between">
                <span className="font-display text-[24px] leading-[1.1] text-white transition-colors group-hover:text-gold sm:text-[28px]">
                  {link.label}
                </span>
                <div className="h-[1px] w-0 bg-gold/50 transition-all duration-300 group-hover:w-8" />
              </Link>
            ))}
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

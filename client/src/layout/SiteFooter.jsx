import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';

const DAY_LABELS = {
  monday: 'Måndag',
  tuesday: 'Tisdag',
  wednesday: 'Onsdag',
  thursday: 'Torsdag',
  friday: 'Fredag',
  saturday: 'Lördag',
  sunday: 'Söndag'
};

const WEEK_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const InstagramIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SiteFooter = () => {
  const { data: restaurantData } = useRestaurantStatus();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#05090e] pt-16 pb-8 text-white">
      <div className="mx-auto w-full max-w-[2200px] px-4 sm:px-6 lg:w-[92vw] lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="font-display text-3xl tracking-[0.3em] text-gold">
              VENUS
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              En kulinarisk resa genom eld och passion. Vi serverar premiumupplevelser med fokus på kvalitet och hantverk.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-gold hover:text-gold"
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Navigation</h4>
            <nav className="flex flex-col gap-4 text-sm text-white/50">
              <Link to="/" className="transition-colors hover:text-white" onClick={() => window.scrollTo(0, 0)}>Hem</Link>
              <Link to="/menu" className="transition-colors hover:text-white">Meny</Link>
              <Link to="/reservations" className="transition-colors hover:text-white">Boka Bord</Link>
              <Link to="/about" className="transition-colors hover:text-white">Om Oss</Link>
              <Link to="/bespoke" className="transition-colors hover:text-white">Skräddarsytt</Link>
            </nav>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Kontakt</h4>
            <div className="space-y-4 text-sm text-white/50">
              <div className="group">
                <a 
                  href="https://www.google.com/maps/place/Pizzeria+Venus/@59.2869414,15.1773326,17z/data=!3m1!4b1!4m6!3m5!1s0x465c152c1fd82447:0x43c6d995c0863e13!8m2!3d59.2869414!4d15.1799129!16s%2Fg%2F1yh9ttv40" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <MapPin size={18} className="mt-0.5 text-gold" />
                  <span>Varbergagatan 39A<br />703 51 Örebro</span>
                </a>
              </div>
              <div>
                <a href="tel:019257090" className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone size={18} className="text-gold" />
                  <span>019 - 25 70 90</span>
                </a>
              </div>
              <div>
                <a href="mailto:info@venusrestaurant.se" className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail size={18} className="text-gold" />
                  <span>info@venusrestaurant.se</span>
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Öppettider</h4>
            <div className="space-y-4 text-sm text-white/50">
              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 text-gold" />
                <div className="w-full space-y-2">
                  {WEEK_ORDER.map((key) => {
                    const oh = restaurantData?.week?.[key];
                    const label = DAY_LABELS[key];
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Europe/Stockholm' }).toLowerCase() === key;
                    
                    return (
                      <div key={key} className={`flex gap-1 ${isToday ? 'text-white font-bold' : ''}`}>
                        <span className="w-[62px] shrink-0">{label}:</span>
                        {oh?.closed ? (
                          <span className="text-red-500/50 uppercase text-[10px] tracking-tighter">Stängt</span>
                        ) : (
                          <span className={isToday ? 'text-gold' : 'text-white/80'}>{oh?.open} - {oh?.close}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-white/30 uppercase tracking-widest">
          <p>© {currentYear} VENUS RESTAURANT. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

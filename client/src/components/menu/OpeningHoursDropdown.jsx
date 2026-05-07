import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

const OpeningHoursDropdown = ({ week, statusText, isOpen: isCurrentlyOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!week) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        {statusText && (
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isCurrentlyOpen ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`} />
            <span className={`text-[11px] font-medium tracking-wide ${isCurrentlyOpen ? 'text-green-300/90' : 'text-red-300/90'}`}>
              {statusText}
            </span>
          </div>
        )}
        
        {statusText && <div className="h-3 w-[1px] bg-white/10" />}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-1.5 text-white/50 transition-colors hover:text-gold"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Öppettider</span>
          <ChevronDown 
            size={12} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold' : 'group-hover:text-gold'}`} 
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full z-50 mt-2 w-[190px] origin-top-right overflow-hidden rounded-xl border border-white/10 bg-[#0f141a]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
          isOpen 
            ? 'pointer-events-auto scale-100 opacity-100' 
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="border-b border-white/5 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-gold">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Öppettider</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {Object.entries(week).map(([day, cfg]) => {
              const dayNames = {
                monday: 'Måndag',
                tuesday: 'Tisdag',
                wednesday: 'Onsdag',
                thursday: 'Torsdag',
                friday: 'Fredag',
                saturday: 'Lördag',
                sunday: 'Söndag'
              };
              const isToday = new Date().toLocaleDateString('sv-SE', { weekday: 'long' }).toLowerCase() === dayNames[day.toLowerCase()].toLowerCase();
              
              return (
                <div key={day} className={`flex items-center gap-1 text-[11px] ${isToday ? 'text-white font-medium' : 'text-white/50'}`}>
                  <span className="w-[62px] shrink-0 capitalize">{dayNames[day.toLowerCase()] || day}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-1 w-1 rounded-full ${cfg.closed ? 'bg-red-400' : 'bg-green-400'}`} />
                    <span>{cfg.closed ? 'Stängt' : `${cfg.open} - ${cfg.close}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] px-4 py-2 text-center text-[9px] text-white/30 uppercase tracking-widest border-t border-white/5">
          Venus Restaurant
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursDropdown;

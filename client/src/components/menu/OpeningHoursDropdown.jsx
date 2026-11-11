import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

const OpeningHoursDropdown = ({ week, statusText, isOpen: isCurrentlyOpen, isRollover }) => {
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
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-3 rounded-full border border-white/15 bg-black/80 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3.5 md:py-1.5 shadow-xl shadow-black/50 hover:border-gold/40 transition-all duration-300">
        {statusText && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div 
              className={`h-1.5 w-1.5 rounded-full animate-pulse shrink-0 ${
                isCurrentlyOpen 
                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]' 
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
              }`} 
            />
            <span 
              className={`text-[9.5px] sm:text-[10.5px] md:text-[12px] font-semibold tracking-wide whitespace-nowrap ${
                isCurrentlyOpen ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {statusText}
            </span>
          </div>
        )}
        
        {statusText && <div className="h-2.5 sm:h-3 md:h-3.5 w-[1px] bg-white/20" />}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-1 text-white/70 transition-colors hover:text-gold"
          title="Visa fullständiga öppettider"
        >
          <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
            Öppettider
          </span>
          <ChevronDown 
            size={11} 
            className={`transition-transform duration-300 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 ${isOpen ? 'rotate-180 text-gold' : 'group-hover:text-gold'}`} 
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full z-50 mt-2 w-[190px] sm:w-[220px] origin-top-right overflow-hidden rounded-2xl border border-white/15 bg-[#0f141a]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
          isOpen 
            ? 'pointer-events-auto scale-100 opacity-100' 
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="border-b border-white/10 bg-white/5 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-gold">
            <Clock size={13} className="sm:w-3.5 sm:h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em]">Öppettider</span>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
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
              
              const WEEK_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              const todayKey = WEEK_KEYS[(new Date().getDay() + 6) % 7];
              const yesterdayKey = WEEK_KEYS[(new Date().getDay() + 5) % 7];
              
              const isHighlighted = isRollover 
                ? day.toLowerCase() === yesterdayKey 
                : day.toLowerCase() === todayKey;
              
              return (
                <div key={day} className={`flex items-center justify-between text-[10.5px] sm:text-[12px] ${isHighlighted ? 'text-gold font-bold' : 'text-white/65'}`}>
                  <span className="capitalize">{dayNames[day.toLowerCase()] || day}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${cfg.closed ? 'bg-red-400' : 'bg-green-400'}`} />
                    <span>{cfg.closed ? 'Stängt' : `${cfg.open} - ${cfg.close}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] px-3 py-1.5 text-center text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest border-t border-white/5">
          Venus Restaurant
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursDropdown;

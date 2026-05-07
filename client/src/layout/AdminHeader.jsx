import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Calendar, Users, Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Beställningar', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Bokningar', path: '/admin/bookings', icon: Calendar },
  { label: 'Förfrågningar', path: '/admin/inquiries', icon: Users },
  { label: 'Översikt', path: '/admin', icon: LayoutDashboard }
];

const AdminHeader = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-[92vw] max-w-[1800px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-[0.2em] text-gold transition-colors hover:text-white">
            <ArrowLeft size={16} />
            VENUS
          </Link>
          
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:text-gold ${
                    isActive ? 'text-gold' : 'text-white/40'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-white/20 lg:block border-r border-white/10 pr-4">Admin Portal</span>
          
          <button 
            onClick={logout} 
            className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400/60 transition-colors hover:text-red-400"
          >
            <LogOut size={14} />
            Logga ut
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-gold lg:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`absolute left-0 top-full w-full border-b border-white/10 bg-background transition-all duration-300 lg:hidden ${
        isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 pointer-events-none opacity-0'
      }`}>
        <nav className="flex flex-col p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 py-4 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 last:border-0 ${
                  isActive ? 'text-gold' : 'text-white/40'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          
          <button 
            onClick={logout} 
            className="flex items-center gap-4 py-4 text-[11px] font-bold uppercase tracking-widest text-red-400/60 transition-colors hover:text-red-400 border-t border-white/10 mt-2"
          >
            <LogOut size={18} />
            Logga ut
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;

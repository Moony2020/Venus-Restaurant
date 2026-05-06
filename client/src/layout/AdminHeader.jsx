import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ClipboardList, CalendarDays, LogOut, ChevronLeft, Settings } from 'lucide-react';

const AdminHeader = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-white/5 bg-[#0a0a0b] py-4">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 text-gold group">
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-display text-xl tracking-[0.2em]">VENUS</span>
          </Link>
          
          <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
            <Link to="/admin/leads" className="flex items-center gap-2 hover:text-white transition-colors">
              <Users size={14} />
              Leads
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-2 hover:text-white transition-colors">
              <ClipboardList size={14} />
              Orders
            </Link>
            <Link to="/admin/bookings" className="flex items-center gap-2 hover:text-white transition-colors">
              <CalendarDays size={14} />
              Bookings
            </Link>
            <Link to="/admin" className="flex items-center gap-2 hover:text-white transition-colors">
              <Settings size={14} />
              Control
            </Link>
            <Link to="/admin/overview" className="flex items-center gap-2 hover:text-white transition-colors">
              <LayoutDashboard size={14} />
              Stats
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[9px] uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1">Administrator</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, ShoppingCart, Calendar, Users, Menu, X, ArrowLeft, LogOut, Bell } from 'lucide-react';
import { io as createSocket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : (import.meta.env.PROD ? undefined : 'http://localhost:5000');

const NOTIF_STORAGE_KEY = 'venus_admin_notifications';

const navItems = [
  { label: 'Beställningar', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Bokningar', path: '/admin/bookings', icon: Calendar },
  { label: 'Förfrågningar', path: '/admin/inquiries', icon: Users },
  { label: 'System', path: '/admin/system', icon: Activity },
  { label: 'Översikt', path: '/admin', icon: LayoutDashboard }
];

const loadNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveNotifications = (list) => {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch { /* ignore */ }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just nu';
  if (mins < 60) return `${mins} min sedan`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h sedan`;
  return `${Math.floor(hrs / 24)}d sedan`;
};

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(loadNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const next = [notif, ...prev].slice(0, 50);
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const handleNotifClick = useCallback((notif) => {
    // Mark this one as read
    setNotifications((prev) => {
      const next = prev.map((n) => n.id === notif.id ? { ...n, read: true } : n);
      saveNotifications(next);
      return next;
    });
    setIsNotifOpen(false);

    // Navigate to the relevant admin page
    if (notif.type === 'order') {
      navigate('/admin/orders');
    } else if (notif.type === 'booking') {
      navigate('/admin/bookings');
    } else if (notif.type === 'inquiry') {
      navigate('/admin/inquiries');
    }
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Socket.IO listener for real-time notifications
  useEffect(() => {
    const socket = createSocket(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true
    });

    socket.on('order:new', (order) => {
      addNotification({
        id: `order_${order._id || Date.now()}`,
        type: 'order',
        title: 'Ny beställning',
        message: `${order.customerName || 'Kund'} — ${order.totalAmount || 0} kr`,
        time: order.createdAt || new Date().toISOString(),
        read: false,
        refId: order._id
      });
    });

    socket.on('booking:new', (booking) => {
      addNotification({
        id: `booking_${booking._id || Date.now()}`,
        type: 'booking',
        title: 'Ny bokning',
        message: `${booking.name || 'Gäst'} — ${booking.guests || '?'} pers, ${booking.date} kl ${booking.time}`,
        time: booking.createdAt || new Date().toISOString(),
        read: false,
        refId: booking._id
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [addNotification]);

  const typeIcon = (type) => {
    if (type === 'order') return <ShoppingCart size={14} />;
    if (type === 'booking') return <Calendar size={14} />;
    return <Users size={14} />;
  };

  const typeColor = (type) => {
    if (type === 'order') return 'text-green-400';
    if (type === 'booking') return 'text-blue-400';
    return 'text-purple-400';
  };

  const typeLabel = (type) => {
    if (type === 'order') return 'Beställning';
    if (type === 'booking') return 'Bokning';
    return 'Förfrågan';
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-[0.2em] text-gold transition-colors hover:text-white">
            <ArrowLeft size={16} />
            VENUS
          </Link>
          
          <nav className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap pr-2 lg:flex xl:gap-6">
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

        <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen && unreadCount > 0) markAllRead();
              }}
              className="relative rounded-lg border border-white/10 bg-white/5 p-2.5 text-white/60 transition-all hover:border-gold/30 hover:text-gold"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-black shadow-lg shadow-gold/30 animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            <div
              className={`absolute right-0 top-full mt-2 w-[340px] rounded-2xl border border-white/10 bg-[#0c1117] shadow-2xl shadow-black/50 transition-all duration-200 ${
                isNotifOpen
                  ? 'translate-y-0 opacity-100 pointer-events-auto'
                  : '-translate-y-2 opacity-0 pointer-events-none'
              }`}
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Notifikationer</span>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[10px] font-bold uppercase tracking-widest text-red-400/50 transition hover:text-red-400">
                    Rensa alla
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                    <Bell size={28} className="mb-2" />
                    <p className="text-xs italic text-white">Inga notifikationer</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`group flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5 ${
                        notif.read ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Type Icon */}
                      <div className={`mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2 ${typeColor(notif.type)}`}>
                        {typeIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${typeColor(notif.type)}`}>
                            {typeLabel(notif.type)}
                          </span>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] font-semibold text-white/90 truncate group-hover:text-gold transition-colors">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">{notif.message}</p>
                        <p className="mt-1 text-[9px] text-white/20">{timeAgo(notif.time)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <span className="hidden border-r border-white/10 pr-3 text-[10px] font-bold uppercase tracking-widest text-white/20 xl:block">Admin Portal</span>
          
          <button 
            onClick={logout} 
            className="hidden lg:flex items-center gap-2 pl-3 text-[10px] font-bold uppercase tracking-widest text-red-400/60 transition-colors hover:text-red-400"
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

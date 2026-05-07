import { useState } from 'react';
import AdminHeader from '../layout/AdminHeader';

const initialOrders = [
  { table: '04', title: '3x Tasting Menu: "The Astral Journey"', id: '#2249', time: '12 min sedan', status: 'INKOMMANDE' },
  { table: '12', title: '1x Venusian Ribeye, 1x Pan-Seared Arctic Char', id: '#2248', time: '28 min sedan', status: 'KLAR' },
  { table: '09', title: '2x Sommelier Choice Wine Pairing', id: '#2250', time: 'Just nu', status: 'INKOMMANDE' }
];

const AdminDashboard = () => {
  const [orders, setOrders] = useState(initialOrders);

  const toggleStatus = (id) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        return { ...order, status: order.status === 'INKOMMANDE' ? 'KLAR' : 'INKOMMANDE' };
      }
      return order;
    }));
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          {/* Main Content Area */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold mb-1">Admin Portal</p>
                <h2 className="font-display text-4xl sm:text-5xl">Översikt</h2>
                <p className="text-white/40 text-sm mt-2">Operativ status: Alla system fungerar normalt.</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-white/30">Lokal Tid</p>
                <p className="font-display text-4xl">19:42</p>
              </div>
            </div>

            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-6 font-bold">Live-beställningar</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="grid sm:grid-cols-[80px_1fr_140px] items-center gap-6 border border-white/5 bg-panel/20 p-6 hover:border-gold/20 transition-all group">
                  <div className="text-center sm:border-r border-white/10">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Bord</p>
                    <p className="font-display text-3xl text-gold">{order.table}</p>
                  </div>
                  <div>
                    <h4 className="font-display text-2xl mb-1 group-hover:text-gold transition-colors">{order.title}</h4>
                    <p className="text-[9px] uppercase tracking-widest text-white/30">Order {order.id} • {order.time}</p>
                  </div>
                  <button 
                    onClick={() => toggleStatus(order.id)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all rounded ${
                    order.status === 'KLAR' ? 'border-white/10 text-white/30 hover:border-white/30' : 'border-gold/40 text-gold hover:bg-gold hover:text-black shadow-lg shadow-gold/5'
                  }`}>
                    {order.status}
                  </button>
                </article>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <div className="relative aspect-video border border-white/5 overflow-hidden group rounded-xl">
                <img src="/images/grill-fire.png" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="Kitchen" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <p className="absolute bottom-6 left-6 font-display text-xl text-gold">Dining Status: 85%</p>
              </div>
              <div className="relative aspect-video border border-white/5 overflow-hidden group rounded-xl">
                <img src="/images/about-cellar.png" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="Cellar" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <p className="absolute bottom-6 left-6 font-display text-xl text-gold">Källartemp: 12.4°C</p>
              </div>
            </div>
          </div>

          {/* Sidebar / Tools Area */}
          <aside className="space-y-8">
            <div className="border border-white/10 bg-panel/30 p-8 rounded-2xl">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-8 font-bold">Dagens Lunch</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/30 mb-2 block">Rättens namn</label>
                  <input className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white outline-none focus:border-gold transition-colors" placeholder="t.ex. Saffransrisotto" />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/30 mb-2 block">Pris (SEK)</label>
                  <input className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white outline-none focus:border-gold transition-colors" placeholder="185" />
                </div>
                <button className="w-full bg-gold py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10 rounded-lg">
                  Publicera
                </button>
              </div>
            </div>

            <div className="border border-white/5 bg-panel/10 p-8 rounded-2xl">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 mb-6 font-bold">Snabbåtgärder</h3>
              <div className="grid gap-3">
                <button className="w-full border border-white/10 py-3 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:border-gold hover:text-gold transition-all rounded-lg">Exportera Rapport</button>
                <button className="w-full border border-white/10 py-3 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:border-gold hover:text-gold transition-all rounded-lg">Lagerrevision</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;

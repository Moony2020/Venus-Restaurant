import { useState } from 'react';
import AdminHeader from '../layout/AdminHeader';

const orders = [
  { table: '04', title: '3x Tasting Menu: "The Astral Journey"', id: '#2249', time: '12 mins ago', status: 'Inkommande' },
  { table: '12', title: '1x Venusian Ribeye, 1x Pan-Seared Arctic Char', id: '#2248', time: '28 mins ago', status: 'Klar' },
  { table: '09', title: '2x Sommelier Choice Wine Pairing', id: '#2250', time: 'Just now', status: 'Inkommande' }
];

const AdminDashboard = () => {
  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          {/* Main Content Area */}
          <div>
            <div className="flex items-start justify-between mb-12">
              <div>
                <h2 className="font-display text-5xl text-gold mb-2">System Overview</h2>
                <p className="text-white/50 text-lg">Operational status: All systems nominal.</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-white/30">Local Time</p>
                <p className="font-display text-4xl">19:42</p>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-6">Live Orders</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="grid sm:grid-cols-[80px_1fr_140px] items-center gap-6 border border-white/5 bg-panel/20 p-6 hover:border-gold/20 transition-colors">
                  <div className="text-center sm:border-r border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Table</p>
                    <p className="font-display text-4xl text-gold">{order.table}</p>
                  </div>
                  <div>
                    <h4 className="font-display text-3xl mb-1">{order.title}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Order {order.id} • {order.time}</p>
                  </div>
                  <button className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                    order.status === 'Klar' ? 'border-white/10 text-white/30' : 'border-gold/40 text-gold hover:bg-gold hover:text-black'
                  }`}>
                    {order.status}
                  </button>
                </article>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <div className="relative aspect-video border border-white/5 overflow-hidden group">
                <img src="/images/grill-fire.png" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" alt="Kitchen" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <p className="absolute bottom-6 left-6 font-display text-2xl text-gold">Dining Status: 85%</p>
              </div>
              <div className="relative aspect-video border border-white/5 overflow-hidden group">
                <img src="/images/about-cellar.png" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" alt="Cellar" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <p className="absolute bottom-6 left-6 font-display text-2xl text-gold">Cellar Temp: 12.4°C</p>
              </div>
            </div>
          </div>

          {/* Sidebar / Tools Area */}
          <aside className="space-y-8">
            <div className="border border-white/10 bg-panel/30 p-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-8">Update Dagens Lunch</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/30 mb-2 block">Dish Name</label>
                  <input className="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-gold transition-colors" placeholder="e.g. Saffron Risotto" />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/30 mb-2 block">Price (SEK)</label>
                  <input className="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-gold transition-colors" placeholder="185" />
                </div>
                <button className="w-full bg-gold py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10">
                  Publish Update
                </button>
              </div>
            </div>

            <div className="border border-white/5 bg-panel/10 p-8">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 mb-6">Quick Actions</h3>
              <div className="grid gap-4">
                <button className="w-full border border-white/10 py-3 text-[10px] uppercase tracking-widest text-white/60 hover:border-gold hover:text-gold transition-all">Export Report</button>
                <button className="w-full border border-white/10 py-3 text-[10px] uppercase tracking-widest text-white/60 hover:border-gold hover:text-gold transition-all">Inventory Audit</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;


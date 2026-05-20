import { Link } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, X } from 'lucide-react';

const Cart = () => {
  const { items, total, removeFromCart, updateQty, removeExtra } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-white">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-5xl sm:text-7xl mb-8">Din korg är tom</h1>
          <Link to="/menu" className="inline-flex items-center justify-center border border-gold px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-black rounded-full hover:scale-105 active:scale-95 transition-all duration-300 w-fit mx-auto">
            Se vår meny
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 pt-4 pb-20 lg:pt-6 lg:pb-32">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6">Din Beställning</h1>
        
        <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            {items.map((item) => (
              <article key={item.id || item._id} className="flex flex-col sm:flex-row gap-8 items-start border-b border-white/5 pb-8">
                <div className="aspect-square w-32 bg-panel overflow-hidden border border-white/10">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-2">{item.category}</p>
                      <h2 className="font-display text-3xl">{item.name}</h2>
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-4 space-y-3 pl-1">
                          {item.extras.map((extra, idx) => (
                            <div key={`${extra.optionId}-${idx}`} className="flex items-center justify-between group/extra max-w-sm">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => removeExtra(item.id || item._id, extra.groupId, extra.optionId)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white/40 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all shadow-sm"
                                  title={`Ta bort ${extra.label}`}
                                >
                                  <X size={10} strokeWidth={3} />
                                </button>
                                <span className="text-xs text-gold/70 font-medium italic leading-none tracking-tight">{extra.label}</span>
                              </div>
                              <span className="text-xs text-gold/60 font-bold leading-none">+ {extra.price} KR</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.notes && <p className="mt-2 text-sm text-white/40 italic">Obs: {item.notes}</p>}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id || item._id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-white/10 bg-black/40">
                      <button 
                        onClick={() => updateQty(item.id || item._id, item.quantity - 1)}
                        className="px-4 py-2 text-white/40 hover:text-gold"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-sm font-medium w-12 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.id || item._id, item.quantity + 1)}
                        className="px-4 py-2 text-white/40 hover:text-gold"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-xl text-gold font-display">{item.subtotal ?? item.price * item.quantity} KR</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit">
            <div className="border border-gold/20 bg-panel/30 p-10 space-y-8 sticky top-32">
              <h2 className="font-display text-4xl mb-4 text-white">Sammanfattning</h2>
              
              <div className="space-y-4 border-b border-white/5 pb-8 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Delsumma</span>
                  <span>{Math.round(total)} KR</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Serviceavgift</span>
                  <span>0 KR</span>
                </div>
              </div>
              
              <div className="flex justify-between items-baseline">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Totalt</p>
                <p className="font-display text-5xl text-gold">{Math.round(total)} KR</p>
              </div>
              
              <Link 
                to="/checkout" 
                className="flex w-full items-center justify-center rounded-full bg-gold py-4 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-goldSoft hover:scale-[1.02] active:scale-95 shadow-xl shadow-gold/15"
              >
                Fortsätt till kassan
              </Link>
              
              <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em]">
                Gratis avbokning upp till 24h innan
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Cart;

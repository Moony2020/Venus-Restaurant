import { Link } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const { items, total, removeFromCart, updateQty } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-white">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-5xl sm:text-7xl mb-8">Din korg är tom</h1>
          <Link to="/menu" className="border border-gold px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-black transition-all">
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
                      {item.optionSummary && <p className="mt-2 text-sm text-gold/60">{item.optionSummary}</p>}
                      {item.notes && <p className="mt-1 text-sm text-white/40 italic">{item.notes}</p>}
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
                className="block w-full bg-gold py-5 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-black transition-all hover:bg-goldSoft shadow-xl shadow-gold/10"
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

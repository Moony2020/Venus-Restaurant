import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartSidebar = ({
  items,
  total,
  count,
  orderMode,
  onOrderModeChange,
  deliveryAvailable,
  deliveryFee,
  pickupEtaText,
  deliveryEtaText,
  restaurantOpen = true,
  updateQuantity,
  removeFromCart
}) => {
  const { removeExtra } = useCart();
  const finalTotal = total + (orderMode === 'delivery' ? deliveryFee : 0);
  const etaText = orderMode === 'delivery' ? deliveryEtaText : pickupEtaText;

  return (
    <aside className="sticky top-[140px] mt-8 hidden h-fit rounded-2xl border border-white/15 bg-white/[0.03] p-4 pb-7 min-[1200px]:block">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-inner">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => deliveryAvailable && onOrderModeChange('delivery')}
            disabled={!deliveryAvailable}
            className={`rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-all duration-300 ${
              orderMode === 'delivery'
                ? 'border-gold bg-gold text-black shadow-lg shadow-gold/20'
                : deliveryAvailable
                  ? 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
                  : 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35'
            }`}
          >
            Leverans
          </button>
          <button
            type="button"
            onClick={() => onOrderModeChange('pickup')}
            className={`rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-all duration-300 ${
              orderMode === 'pickup'
                ? 'border-gold bg-gold text-black shadow-lg shadow-gold/20'
                : 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
            }`}
          >
            Hämta själv
          </button>
        </div>

        <div className="mt-4 px-1">
          {!deliveryAvailable && orderMode === 'delivery' ? (
            <p className="text-white/55 text-xs italic">Ej tillgänglig för leverans</p>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-widest text-white/40">{orderMode === 'pickup' ? 'Upphämtningstid' : 'Leveranstid'}</p>
              <p className="text-base font-semibold text-white/90">{etaText}</p>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-[11px] uppercase tracking-widest text-white/50">
          <span>Leveransavgift</span>
          <span className="font-bold text-white/80">{orderMode === 'delivery' ? `${deliveryFee} kr` : '0 kr'}</span>
        </div>
      </div>

      <div className="mt-6 max-h-[520px] space-y-5 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center opacity-20">
            <ShoppingBag size={48} className="mb-4 text-white" strokeWidth={1} />
            <p className="text-sm text-white italic">Din varukorg är tom</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={`${item.id}-${i}`} className="group relative border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <div className="flex gap-3">
                {/* Image Thumbnail */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  <img 
                    src={item.image || '/images/menu-pizza.png'} 
                    alt={item.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                
                {/* Content */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-medium text-white/95 leading-tight group-hover:text-gold transition-colors">{item.name}</p>
                        {item.basePrice && (
                          <p className="text-[10px] text-white/30 font-medium">{item.basePrice} kr/st</p>
                        )}
                      </div>
                      <p className="text-[14px] font-bold text-gold whitespace-nowrap">{Math.round(item.price * item.quantity)} kr</p>
                    </div>
                    
                    {/* Extras List */}
                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-2.5 space-y-2 pl-1">
                        {item.extras.map((extra, idx) => (
                          <div key={`${extra.optionId}-${idx}`} className="flex items-center justify-between group/extra animate-in fade-in slide-in-from-left-1 duration-300">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => removeExtra(item.id, extra.groupId, extra.optionId)}
                                className="flex h-4 w-4 items-center justify-center rounded-sm border border-white/10 bg-white/[0.05] text-white/40 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all shadow-sm"
                                title={`Ta bort ${extra.label}`}
                              >
                                <X size={8} strokeWidth={3} />
                              </button>
                              <span className="text-[10px] text-gold/70 font-medium italic leading-none tracking-tight">{extra.label}</span>
                            </div>
                            <span className="text-[10px] text-gold/60 font-bold leading-none">+ {extra.price} kr</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-1.5 py-0.5 text-white/40 transition hover:text-gold hover:bg-white/5 rounded-md"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="min-w-[18px] text-center text-[10px] font-bold text-white/90">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-1.5 py-0.5 text-white/40 transition hover:text-gold hover:bg-white/5 rounded-md"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label={`Ta bort ${item.name}`}
                      title="Ta bort"
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/35 transition-colors hover:border-red-400/40 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        {!restaurantOpen && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Stängt för beställning</p>
          </div>
        )}
        
        <div className="flex items-center justify-between px-1 mb-5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">Summa</span>
          <span className="text-2xl font-display text-gold font-bold tracking-tight">{finalTotal} kr</span>
        </div>

        {count > 0 && restaurantOpen ? (
          <Link 
            to="/cart" 
            className="group relative block w-full overflow-hidden rounded-xl border border-gold bg-gold px-4 py-4 text-center transition-all duration-500 hover:shadow-[0_0_25px_rgba(200,164,77,0.4)]"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black">Gå till varukorg</span>
            </div>
            {/* Balanced gold hover for a subtle glow */}
            <div className="absolute inset-0 translate-y-full bg-[#d4b56a] transition-transform duration-500 group-hover:translate-y-0" />
          </Link>
        ) : (
          <span className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-[11px] font-black uppercase tracking-[0.25em] text-white/20">
            {count === 0 ? 'Varukorgen är tom' : 'Gå till varukorg'}
          </span>
        )}
      </div>
    </aside>
  );
};

export default CartSidebar;

import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

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
  const finalTotal = total + (orderMode === 'delivery' ? deliveryFee : 0);
  const etaText = orderMode === 'delivery' ? deliveryEtaText : pickupEtaText;

  return (
    <aside className="sticky top-[100px] hidden h-fit rounded-2xl border border-white/15 bg-white/[0.03] p-4 min-[1200px]:block">
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

      <div className="mt-6 max-h-[420px] space-y-5 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-20">
            <ShoppingBag size={48} className="mb-4 text-white" strokeWidth={1} />
            <p className="text-sm text-white italic">Din varukorg är tom</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={`${item.id}-${i}`} className="group relative border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <div className="flex justify-between gap-4">
                {/* Left: Content */}
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white/95 leading-tight group-hover:text-gold transition-colors">{item.name}</p>
                  {item.optionSummary && (
                    <p className="mt-1.5 text-[10px] leading-relaxed text-gold/60 font-medium italic">{item.optionSummary}</p>
                  )}
                  {item.notes && (
                    <p className="mt-1 text-[10px] leading-relaxed text-white/30 border-l border-white/10 pl-2">"{item.notes}"</p>
                  )}
                </div>
                
                {/* Right: Actions and Price */}
                <div className="flex flex-col items-end gap-3 min-w-[100px]">
                  {/* Price on top right */}
                  <div className="text-right">
                    <p className="text-[15px] font-bold text-gold tracking-tight">{item.price * item.quantity} kr</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/20">{item.price} kr/st</p>
                  </div>
                  
                  {/* Actions below price */}
                  <div className="flex items-center gap-2">
                    {/* +/- controls on the left of trash */}
                    <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-white/40 transition hover:text-gold hover:bg-white/5 rounded-md"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="min-w-[22px] text-center text-[11px] font-bold text-white/90">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-white/40 transition hover:text-gold hover:bg-white/5 rounded-md"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Trash icon below price, right of controls */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/20 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 group/trash"
                      title="Ta bort"
                    >
                      <Trash2 size={12} className="group-hover/trash:scale-110 transition-transform" />
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
            className="group relative block w-full overflow-hidden rounded-xl border border-gold bg-gold px-4 py-4 text-center transition-all duration-500 hover:shadow-[0_0_20px_rgba(200,164,77,0.3)]"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black">Gå till varukorg</span>
            </div>
            <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" />
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

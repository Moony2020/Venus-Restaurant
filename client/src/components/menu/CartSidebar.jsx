import { Link } from 'react-router-dom';

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
  restaurantOpen = true
}) => {
  const finalTotal = total + (orderMode === 'delivery' ? deliveryFee : 0);
  const etaText = orderMode === 'delivery' ? deliveryEtaText : pickupEtaText;

  return (
    <aside className="sticky top-[100px] hidden h-fit border border-white/15 bg-white/[0.03] p-4 xl:block">
      <div className="border border-white/10 bg-white/[0.04] p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => deliveryAvailable && onOrderModeChange('delivery')}
            disabled={!deliveryAvailable}
            className={`border px-3 py-2 text-[11px] uppercase tracking-[0.13em] transition ${
              orderMode === 'delivery'
                ? 'border-gold bg-gold text-black'
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
            className={`border px-3 py-2 text-[11px] uppercase tracking-[0.13em] transition ${
              orderMode === 'pickup'
                ? 'border-gold bg-gold text-black'
                : 'border-white/20 bg-white/[0.03] text-white/70 hover:border-gold/50 hover:text-gold'
            }`}
          >
            Hämta själv
          </button>
        </div>

        <div className="mt-3">
          {!deliveryAvailable && orderMode === 'delivery' ? (
            <p className="text-white/55">Ej tillgänglig</p>
          ) : (
            <>
              <p className="text-xs text-white/60">{orderMode === 'pickup' ? 'Upphämtningstid' : 'Leveranstid'}</p>
              <p className="text-base font-semibold text-white/90">{etaText}</p>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-white/65">
          <span>Leveransavgift</span>
          <span>{orderMode === 'delivery' ? `${deliveryFee} kr` : '0 kr'}</span>
        </div>
      </div>

      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-sm text-white/50">Din varukorg är tom.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 text-sm">
              <div>
                <p className="text-[15px] text-white">{item.name}</p>
                <p className="text-[13px] text-white/50">{item.quantity} x {item.price} kr</p>
              </div>
              <p className="text-[15px] text-gold">{item.quantity * item.price} kr</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        {!restaurantOpen && <p className="mb-2 text-xs text-red-300">Restaurangen är stängd just nu</p>}
        <p className="flex items-center justify-between text-[17px]">
          <span>Totalt</span>
          <span className="text-gold">{finalTotal} kr</span>
        </p>
        {count > 0 && restaurantOpen ? (
          <Link to="/checkout" className="mt-3 block w-full border border-gold bg-gold px-3 py-3 text-center text-[11px] uppercase tracking-[0.16em] text-black transition hover:bg-goldSoft">
            Förhandsgranska beställning
          </Link>
        ) : (
          <span className="mt-3 block w-full cursor-not-allowed border border-white/20 bg-white/10 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-white/40">
            Förhandsgranska beställning
          </span>
        )}
      </div>
    </aside>
  );
};

export default CartSidebar;

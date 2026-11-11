import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, X, Clock, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const CartSidebar = ({
  items = [],
  total = 0,
  count = 0,
  orderMode = 'pickup',
  onOrderModeChange,
  deliveryAvailable = true,
  deliveryFee = 39,
  pickupEtaText = '10 - 15 minuter',
  deliveryEtaText = '25 - 40 minuter',
  restaurantOpen = true,
  updateQuantity,
  removeFromCart,
  clearCart: clearCartProp,
  restaurantStatus,
  isDrawer = false,
  onClose
}) => {
  const { removeExtra, clearCart: clearCartContext } = useCart();
  const clearCart = clearCartProp || clearCartContext;

  const finalTotal = total + (orderMode === 'delivery' ? deliveryFee : 0);
  const etaText = orderMode === 'delivery' ? deliveryEtaText : pickupEtaText;

  // Compute today's hours and next opening time
  const { todayHours, openTime } = useMemo(() => {
    const todayIndex = new Date().getDay();
    const todayKey = DAY_KEYS[todayIndex];
    const todaySched = restaurantStatus?.week?.[todayKey];

    const tHours = todaySched && !todaySched.closed
      ? `${todaySched.open} – ${todaySched.close}`
      : '11:00 – 22:00';

    let oTime = '11:00';
    if (restaurantStatus?.nowStatus?.text) {
      const match = restaurantStatus.nowStatus.text.match(/kl\s*(\d{1,2}:\d{2})/i);
      if (match) oTime = match[1];
    } else if (todaySched?.open) {
      oTime = todaySched.open;
    }

    return { todayHours: tHours, openTime: oTime };
  }, [restaurantStatus]);

  const Container = isDrawer ? 'div' : 'aside';
  const containerClasses = isDrawer
    ? 'w-full'
    : 'sticky top-[150px] mt-8 hidden h-fit min-[1200px]:block';

  return (
    <Container className={containerClasses}>
      {isDrawer && (
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h2 className="font-display text-2xl text-white">Din varukorg</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white transition-colors"
            aria-label="Stäng varukorg"
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* 1. Main Cart Card */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 pb-6 backdrop-blur-md shadow-2xl">
        {/* Delivery / Pickup Tabs */}
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

          {/* Clean ETA and delivery fee info box */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-white/40 shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                  {orderMode === 'pickup' ? 'UPPHÄMTNINGSTID' : 'LEVERANSTID'}
                </p>
                <p className="text-[12.5px] font-semibold text-white/90 leading-tight">
                  {etaText || (orderMode === 'pickup' ? '10 – 15 minuter' : '25 – 40 minuter')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">AVGIFT</p>
              <p className="text-[12px] font-bold text-emerald-400 leading-tight">
                {orderMode === 'delivery' ? `${deliveryFee} kr` : '0 kr (Fri)'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Items Header */}
        <div className="mt-5 flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            DINA VALDA RÄTTER ({count})
          </span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-medium text-white/40 hover:text-red-400 transition-colors lowercase"
            >
              töm
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="max-h-[460px] space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-25">
              <ShoppingBag size={42} className="mb-3 text-white" strokeWidth={1} />
              <p className="text-xs text-white italic">Din varukorg är tom</p>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={`${item.id}-${i}`} className="group relative border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img
                      src={item.image || '/images/menu-pizza.webp'}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[12.5px] font-medium text-white/95 leading-tight group-hover:text-gold transition-colors">
                            {item.quantity > 1 ? `${item.quantity}x ` : '1x '}
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[10.5px] text-white/40 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <p className="text-[13px] font-bold text-gold whitespace-nowrap">
                          {Math.round(item.price * item.quantity)} kr
                        </p>
                      </div>

                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-2 space-y-1.5 pl-1">
                          {item.extras.map((extra, idx) => (
                            <div key={`${extra.optionId}-${idx}`} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => removeExtra(item.id, extra.groupId, extra.optionId)}
                                  className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-white/10 bg-white/[0.05] text-white/40 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                  title={`Ta bort ${extra.label}`}
                                >
                                  <X size={8} strokeWidth={3} />
                                </button>
                                <span className="text-gold/70 italic leading-none">{extra.label}</span>
                              </div>
                              <span className="text-gold/60 font-semibold">+ {extra.price} kr</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-white/40 transition hover:text-gold hover:bg-white/5 rounded-md"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="min-w-[18px] text-center text-[10px] font-bold text-white/90">
                          {item.quantity}
                        </span>
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
                        className="rounded-md border border-white/10 bg-white/5 p-1 text-white/35 transition-colors hover:border-red-400/40 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary */}
        <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center justify-between px-1 text-[12px] text-white/60">
            <span>Delsumma</span>
            <span className="font-medium text-white/90">{total} kr</span>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-white/40">
            <span>Moms (12%) ingår</span>
            <span>{(finalTotal * 0.12).toFixed(2)} kr</span>
          </div>

          <div className="flex items-center justify-between px-1 pt-2 border-t border-white/5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold">TOTALT ATT BETALA</span>
            <span className="text-2xl font-display text-gold font-bold tracking-tight">{finalTotal} kr</span>
          </div>

          {/* Action Buttons:
              If open: "TILL KASSAN (GÅ VIDARE)" (or "Varukorgen är tom" if 0 items)
              If closed: "STÄNGT FÖR BESTÄLLNING" (disabled) + "BOKA BORD ISTÄLLET →" */}
          {restaurantOpen ? (
            count > 0 ? (
              <Link
                to="/checkout"
                onClick={() => isDrawer && onClose && onClose()}
                className="mt-3 group relative flex items-center justify-center gap-2 w-full overflow-hidden rounded-xl border border-gold bg-gold px-4 py-3.5 text-center font-bold text-xs uppercase tracking-[0.2em] text-black shadow-lg shadow-gold/20 transition-all duration-300 hover:bg-[#d4b56a]"
              >
                <span>TILL KASSAN</span>
                <span className="text-sm">→</span>
              </Link>
            ) : (
              <span className="mt-3 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
                Varukorgen är tom
              </span>
            )
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-red-400/90 shadow-[0_0_12px_rgba(239,68,68,0.12)] cursor-not-allowed">
                <Lock size={13} className="text-red-400" />
                <span>STÄNGT FÖR BESTÄLLNING</span>
              </div>

              <Link
                to="/reservations"
                onClick={() => isDrawer && onClose && onClose()}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-gold/40 bg-gold/[0.04] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-black transition-all duration-300 shadow-sm"
              >
                <span>BOKA BORD ISTÄLLET</span>
                <span>→</span>
              </Link>
            </div>
          )}

          <p className="mt-3 text-center text-[10px] text-white/40 tracking-tight">
            Säker kortbetalning &amp; Swish direkt vid beställning.
          </p>
        </div>
      </div>

      {/* 2. Kitchen Status / Hours Info Card */}
      <div className="mt-3.5 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-md p-4 text-left shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                restaurantOpen
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              }`}
            />
            <span className="text-[12px] font-semibold text-white/95">
              {restaurantOpen ? 'Kökets öppettider:' : 'Kökets status:'}
            </span>
          </div>
          {restaurantOpen ? (
            <span className="text-[11.5px] font-semibold text-white/80 font-mono">
              {todayHours}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
              STÄNGT
            </span>
          )}
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-white/50">
          {restaurantOpen ? (
            <>
              Önskar du specialanpassning vid allergier? Kontakta serveringspersonalen på{' '}
              <a
                href="tel:019123456"
                className="text-gold font-medium hover:underline transition-colors"
              >
                019-12 34 56
              </a>.
            </>
          ) : (
            <>
              Köket öppnar åter kl {openTime}. Vid förfrågningar eller gruppbokningar, ring{' '}
              <a
                href="tel:019123456"
                className="text-gold font-medium hover:underline transition-colors"
              >
                019-12 34 56
              </a>.
            </>
          )}
        </p>
      </div>
    </Container>
  );
};

export default CartSidebar;

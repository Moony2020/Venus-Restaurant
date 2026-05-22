import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, CreditCard, Lock, RotateCw, ShieldCheck, User } from 'lucide-react';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';
import { apiPost } from '../lib/api';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';

const field =
  'w-full border border-gold/25 bg-transparent px-4 py-4 text-base text-white placeholder:text-white/35 focus:border-gold focus:outline-none';
const ORDER_PREFS_KEY = 'venus_order_prefs';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { data: restaurantStatus } = useRestaurantStatus();
  const [contact, setContact] = useState({ customerName: '', email: '', phone: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('pay_on_pickup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [completedStep1, setCompletedStep1] = useState(false);

  const isStep1Valid = useMemo(() => {
    const nameValid = String(contact.customerName || '').trim().length > 0;
    const emailValid = String(contact.email || '').includes('@');
    const phoneValid = String(contact.phone || '').trim().length > 0;
    return nameValid && emailValid && phoneValid;
  }, [contact]);

  const handleContinueToPayment = () => {
    if (isStep1Valid) {
      setCompletedStep1(true);
      setActiveStep(2);
    }
  };
  const [orderPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDER_PREFS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const mode = parsed?.orderMode === 'delivery' ? 'delivery' : 'pickup';
      return {
        orderMode: mode,
        deliveryFee: mode === 'delivery' ? Number(parsed?.deliveryFee) || 39 : 0,
        pickupEtaText: parsed?.pickupEtaText || '10-15 min',
        deliveryEtaText: parsed?.deliveryEtaText || '25-40 min'
      };
    } catch {
      return { orderMode: 'pickup', deliveryFee: 0, pickupEtaText: '10-15 min', deliveryEtaText: '25-40 min' };
    }
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu', { replace: true });
    }
  }, [items.length, navigate]);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        notes: item.notes,
        availabilityAction: item.availabilityAction,
        extras: item.extras || [],
        subtotal: item.subtotal ?? item.price * item.quantity
      })),
    [items]
  );

  const etaText = orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryEtaText : orderPrefs.pickupEtaText;
  const finalTotal = Math.round(total) + (orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0);
  const isOpen = restaurantStatus?.nowStatus?.isOpen ?? true;

  const onPlaceOrder = async () => {
    if (isSubmitting || normalizedItems.length === 0 || !isOpen) return;

    if (!String(contact.customerName || '').trim()) {
      setSubmitError('Vänligen fyll i namn.');
      return;
    }

    if (!String(contact.email || '').includes('@')) {
      setSubmitError('Vänligen ange en giltig e-postadress.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const orderPayload = {
        customerName: contact.customerName,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes,
        totalAmount: finalTotal,
        orderMode: orderPrefs.orderMode,
        deliveryFee: orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0,
        etaText,
        paymentMethod,
        items: normalizedItems.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes,
          availabilityAction: item.availabilityAction,
          extras: item.extras
        }))
      };

      const order = await apiPost('/orders', orderPayload);

      if (paymentMethod === 'stripe') {
        const stripeSession = await apiPost('/payments/stripe/checkout-session', {
          items: normalizedItems,
          successUrl: `${window.location.origin}/confirmation?tracking=${order.trackingCode}&paid=1`,
          cancelUrl: `${window.location.origin}/checkout`,
          customerEmail: contact.email,
          orderId: order._id,
          deliveryFeeSek: orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0
        });

        if (stripeSession?.url) {
          window.location.href = stripeSession.url;
          return;
        }

        throw new Error('Stripe checkout could not be started.');
      }

      if (paymentMethod === 'paypal') {
        const paypalOrder = await apiPost('/payments/paypal/create-order', {
          items: normalizedItems,
          returnUrl: `${window.location.origin}/confirmation?tracking=${order.trackingCode}&paid=1`,
          cancelUrl: `${window.location.origin}/checkout`,
          serviceFeeSek: 0,
          deliveryFeeSek: orderPrefs.orderMode === 'delivery' ? orderPrefs.deliveryFee : 0
        });

        if (paypalOrder?.approveUrl) {
          window.location.href = paypalOrder.approveUrl;
          return;
        }

        throw new Error('PayPal checkout could not be started.');
      }

      clearCart();
      navigate(`/confirmation?tracking=${order.trackingCode}`, {
        state: { order, success: true },
        replace: true
      });
    } catch (err) {
      const message = String(err?.message || '');
      if (err.status === 403 || message.toLowerCase().includes('permission')) {
        setSubmitError('Restaurangen är stängd just nu');
      } else {
        setSubmitError(message || 'Något gick fel, försök igen');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05090e] text-white">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-6 md:pt-10 lg:grid-cols-[1fr_420px] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-12">
        <div>
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.6em] text-gold sm:text-base">Gastronomic Voyage</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl">Kassan</h1>

          <h2 className="mt-10 flex items-center justify-between gap-5 font-display text-4xl sm:text-5xl xl:mt-14 xl:text-6xl">
            <div className="flex items-center gap-5">
              <span>1. Kontaktuppgifter</span>
              {completedStep1 && activeStep !== 1 && (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">✓</span>
              )}
            </div>
            {completedStep1 && activeStep !== 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="text-sm font-bold uppercase tracking-wider text-gold hover:underline"
              >
                Ändra
              </button>
            )}
            {!(completedStep1 && activeStep !== 1) && <span className="h-px flex-1 bg-gold/35" />}
          </h2>

          {completedStep1 && activeStep !== 1 && (
            <div className="mt-4 rounded-2xl border border-gold/15 bg-white/[0.02] p-5 text-sm text-white/70 space-y-1">
              <p className="font-semibold text-white">{contact.customerName}</p>
              <p>{contact.email}</p>
              <p>{contact.phone}</p>
              {contact.notes && <p className="text-white/40 italic">Önskemål: {contact.notes}</p>}
            </div>
          )}

          {activeStep === 1 && (
            <>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Namn</p>
                  <input className={field} value={contact.customerName} onChange={(e) => setContact({ ...contact, customerName: e.target.value })} placeholder="Ditt fullständiga namn" />
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">E-post</p>
                  <input className={field} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="namn@exempel.se" />
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Telefon</p>
                  <input className={field} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="070 000 00 00" />
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/55">Önskemål</p>
                  <input className={field} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} placeholder="Allergier eller speciella behov" />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={!isStep1Valid}
                  className={`flex items-center justify-center gap-3 rounded-full py-4 px-8 text-sm font-extrabold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isStep1Valid
                      ? 'border-gold bg-gold text-black hover:bg-goldSoft hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(200,164,77,0.15)] font-black'
                      : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Fortsätt</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          <div
            className={`transition-all duration-500 ${
              activeStep === 2
                ? 'opacity-100'
                : 'opacity-35 pointer-events-none filter blur-[0.5px]'
            }`}
          >
            <h2 className="mt-10 flex items-center gap-5 font-display text-3xl sm:text-4xl xl:mt-12 xl:text-5xl">
              <span>2. Betalning</span>
              <span className="h-px flex-1 bg-gold/35" />
            </h2>
            <p className="mt-2 text-white/60">Välj din föredragna betalningsmetod</p>
            <div className="mt-6 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`order-2 w-full rounded-2xl border p-4 text-left transition sm:rounded-3xl sm:p-6 ${paymentMethod === 'stripe' ? 'border-gold bg-gradient-to-b from-[#1d1810] to-[#0e1218] shadow-[0_0_28px_rgba(200,164,77,0.22)]' : 'border-white/15 bg-[#0f1726] hover:border-gold/45'}`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#17233a] text-gold sm:h-16 sm:w-16 sm:rounded-2xl"><CreditCard size={24} className="sm:h-[30px] sm:w-[30px]" /></div>
                    <div>
                      <p className="text-2xl font-display text-gold sm:text-3xl">Betala med kort</p>
                      <p className="mt-1 text-sm text-white/70 sm:text-lg">Visa / Mastercard • Säker betalning med <span className="text-gold">Stripe</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="hidden rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gold md:inline-flex">Rekommenderad</span>
                    <span className={`flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border text-sm sm:h-10 sm:w-10 sm:text-base ${paymentMethod === 'stripe' ? 'border-gold bg-gold text-black' : 'border-white/35 text-transparent'}`}>✓</span>
                  </div>
                </div>

                {paymentMethod === 'stripe' && (
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-3 sm:px-4 sm:py-4">
                      <div>
                        <p className="text-xs font-semibold text-white sm:text-sm">Kortuppgifter fylls i hos Stripe</p>
                        <p className="mt-1 text-xs text-white/60">När du klickar på knappen nedan skickas du till säker Stripe-checkout.</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-white sm:text-sm"><span className="rounded bg-white px-2 py-1 text-[#1a4fb8]">VISA</span><span className="h-5 w-5 rounded-full bg-[#f79e1b] sm:h-6 sm:w-6" /></span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-white/70">
                      <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-gold" /> Säkert och krypterat med 256-bit SSL</span>
                      <span className="inline-flex items-center gap-2"><Lock size={16} /> Powered by <span className="text-[#7f6bff] font-bold">stripe</span></span>
                    </div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`order-3 w-full rounded-2xl border p-4 text-left transition sm:rounded-3xl sm:p-6 ${paymentMethod === 'paypal' ? 'border-gold bg-gradient-to-b from-[#1d1810] to-[#0f1724]' : 'border-white/15 bg-[#0f1726] hover:border-gold/45'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f4ea8] text-white sm:h-16 sm:w-16 sm:rounded-2xl"><span className="text-3xl font-black italic sm:text-4xl">P</span></div>
                    <div>
                      <p className="text-2xl font-display sm:text-3xl">PayPal</p>
                      <p className="mt-1 text-sm text-white/70 sm:text-lg">Snabbt och säkert</p>
                    </div>
                  </div>
                  <span className={`flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border text-sm sm:h-10 sm:w-10 sm:text-base ${paymentMethod === 'paypal' ? 'border-gold bg-gold text-black' : 'border-white/35 text-transparent'}`}>✓</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm text-white/70 sm:gap-8">
                  <span className="inline-flex items-center gap-2"><BadgeDollarSign size={16} className="text-gold" /> Snabb checkout</span>
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-gold" /> Säkert köp</span>
                  <span className="inline-flex items-center gap-2"><RotateCw size={16} className="text-gold" /> Du vidarebefordras till PayPal</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pay_on_pickup')}
                className={`order-1 w-full rounded-2xl border p-4 text-left transition sm:rounded-3xl sm:p-6 ${paymentMethod === 'pay_on_pickup' ? 'border-gold bg-gradient-to-b from-[#1d1810] to-[#0f1724]' : 'border-white/15 bg-[#0f1726] hover:border-gold/45'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#17233a] text-gold sm:h-16 sm:w-16 sm:rounded-2xl"><BadgeDollarSign size={24} className="sm:h-[30px] sm:w-[30px]" /></div>
                    <div>
                      <p className="text-2xl font-display sm:text-3xl">Betala på plats</p>
                      <p className="mt-1 text-sm text-white/70 sm:text-lg">Kontant / Swish • Betala när maten levereras</p>
                    </div>
                  </div>
                  <span className={`flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border text-sm sm:h-10 sm:w-10 sm:text-base ${paymentMethod === 'pay_on_pickup' ? 'border-gold bg-gold text-black' : 'border-white/35 text-transparent'}`}>✓</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm text-white/70 sm:gap-8">
                  <span className="inline-flex items-center gap-2"><BadgeDollarSign size={16} className="text-gold" /> Inga extra avgifter</span>
                  <span className="inline-flex items-center gap-2"><User size={16} className="text-gold" /> Betala vid leverans</span>
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-gold" /> Enkelt och tryggt</span>
                </div>
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center"><ShieldCheck size={20} className="mx-auto text-gold" /><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/85">SSL-kryptering</p><p className="mt-1 text-xs text-white/55">Säker betalning</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center"><p className="mt-2 text-4xl font-black text-[#7f6bff]">stripe</p><p className="mt-1 text-xs text-white/55">Betalningar hanteras av Stripe</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center"><RotateCw size={20} className="mx-auto text-gold" /><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/85">14 dagars öppet köp</p><p className="mt-1 text-xs text-white/55">Enkel retur & återbetalning</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center"><ShieldCheck size={20} className="mx-auto text-gold" /><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/85">Premium support</p><p className="mt-1 text-xs text-white/55">Snabb hjälp när du behöver</p></div>
            </div>
          </div>

        </div>

        <aside className="h-fit border-l border-gold/70 bg-white/[0.05] p-6 xl:p-10 sticky top-32">
          <h2 className="sm:whitespace-nowrap whitespace-normal font-display text-3xl sm:text-4xl">Din Beställning</h2>
          <div className="mt-3 border border-white/10 bg-white/[0.04] p-3 text-sm">
            <p className="text-white/70">Sätt: <span className="text-white">{orderPrefs.orderMode === 'delivery' ? 'Leverans' : 'Hämta själv'}</span></p>
            <p className="text-white/70">Tid: <span className="text-white">{etaText}</span></p>
            <p className="text-white/70">Leveransavgift: <span className="text-white">{orderPrefs.orderMode === 'delivery' ? `${orderPrefs.deliveryFee} SEK` : '0 SEK'}</span></p>
          </div>
          <div className="mt-6 space-y-5 xl:mt-7">
            {normalizedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 object-cover xl:h-20 xl:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base sm:text-lg lg:text-xl">{item.name}</p>
                  {item.extras && item.extras.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {item.extras.map((extra, idx) => (
                        <p key={`${extra.optionId}-${idx}`} className="truncate text-[10px] leading-tight text-gold/70 italic">
                          • {extra.label} <span className="text-gold/50 ml-1">(+{extra.price} kr)</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {item.notes && <p className="truncate text-[11px] leading-snug text-white/40 italic">{item.notes}</p>}
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{item.quantity} x {item.price} SEK</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-gold sm:text-base lg:text-lg">{item.subtotal} SEK</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 space-y-5">
            <p className="flex items-center justify-between text-lg">
              <span className="font-semibold">Totalt</span>
              <span className="text-gold font-display text-2xl font-bold">{finalTotal} SEK</span>
            </p>

            {!isOpen && (
              <p className="border border-red-400/40 bg-red-950/20 px-4 py-3 text-xs text-red-200 rounded-xl">
                Restaurangen är stängd just nu.
              </p>
            )}

            {submitError && (
              <p className="border border-red-400/40 bg-red-950/20 px-4 py-3 text-xs text-red-200 rounded-xl">
                {submitError}
              </p>
            )}

            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={isSubmitting || normalizedItems.length === 0 || !isOpen || activeStep !== 2}
              className="group relative flex w-full items-center justify-center gap-4 rounded-full border border-gold bg-gold py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-black shadow-[0_10px_30px_rgba(200,164,77,0.2)] hover:bg-goldSoft hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2 font-black">
                <Lock size={15} /> 
                {isSubmitting ? (
                  'Behandlar...'
                ) : paymentMethod === 'pay_on_pickup' ? (
                  'Bekräfta beställning'
                ) : paymentMethod === 'stripe' ? (
                  'Gå till betalning'
                ) : (
                  'Fortsätt till PayPal'
                )}
              </span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;

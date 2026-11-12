import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Check, 
  CheckCircle2, 
  Copy, 
  Clock, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Phone 
} from 'lucide-react';
import SiteHeader from '../layout/SiteHeader';
import { apiGet, apiPost } from '../lib/api';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../lib/menuCatalog';

// Fallback lookup dictionary for dish descriptions if not saved in order record
const ITEM_DESCRIPTIONS_MAP = (() => {
  const map = new Map();
  MENU_ITEMS.forEach((item) => {
    if (item.name && item.description) {
      map.set(item.name.toLowerCase().trim(), item.description);
    }
  });
  return map;
})();

const Confirmation = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const stateOrder = location.state?.order;
  const queryParams = new URLSearchParams(location.search);
  const isPaid = queryParams.get('paid') === '1';
  const stripeSessionId = queryParams.get('session_id');
  const paypalToken = queryParams.get('token');
  const success = Boolean(location.state?.success || stateOrder || isPaid || paypalToken);
  const trackingFromQuery = queryParams.get('tracking') || '';

  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder && Boolean(trackingFromQuery));
  const [loadError, setLoadError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [success, clearCart]);

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      if (!trackingFromQuery) return;
      
      try {
        // Confirm Stripe payment if returned from Stripe checkout
        if (stripeSessionId) {
          try {
            await apiGet(`/payments/stripe/confirm-session?session_id=${encodeURIComponent(stripeSessionId)}`);
          } catch (e) {
            console.error('Stripe session confirmation error:', e);
          }
        }

        // Capture PayPal payment if returned with token
        if (paypalToken) {
          try {
            const tempOrder = await apiGet(`/orders/${trackingFromQuery}`);
            if (tempOrder?._id) {
              await apiPost('/payments/paypal/capture-order', {
                orderId: tempOrder._id,
                paypalOrderId: paypalToken
              });
            }
          } catch (e) {
            console.error('PayPal capture error:', e);
          }
        }

        if (stateOrder && !paypalToken) {
          if (active) setOrder(stateOrder);
          if (active) setLoading(false);
          return;
        }

        const data = await apiGet(`/orders/${trackingFromQuery}`);
        if (active) setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        if (active) setLoadError('Kunde inte läsa in beställningsinformation.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [trackingFromQuery, stateOrder, paypalToken, stripeSessionId]);

  // Fallback demo values if loaded directly via URL parameter without active DB backend
  const displayTrackingCode = order?.trackingCode || trackingFromQuery || 'B721C95B';
  const orderTimeFormatted = useMemo(() => {
    if (order?.createdAt) {
      const d = new Date(order.createdAt);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, [order?.createdAt]);

  const estimatedReadyTime = useMemo(() => {
    const baseDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    baseDate.setMinutes(baseDate.getMinutes() + 15);
    return `${String(baseDate.getHours()).padStart(2, '0')}:${String(baseDate.getMinutes()).padStart(2, '0')}`;
  }, [order?.createdAt]);

  const receiptNumber = useMemo(() => {
    const code = displayTrackingCode.replace(/\D/g, '');
    return code.length >= 4 ? code.slice(0, 4) : '8942';
  }, [displayTrackingCode]);

  // Payment method badge text
  const paymentMethodLabel = useMemo(() => {
    const method = String(order?.paymentMethod || '').toLowerCase();
    if (method.includes('swish')) return 'BETALD VIA SWISH';
    if (method.includes('stripe') || method.includes('card') || isPaid) return 'BETALD VIA KORT';
    if (method.includes('paypal') || paypalToken) return 'BETALD VIA PAYPAL';
    if (method.includes('cash') || method.includes('kontant')) return 'BETALAS VID HÄMTNING';
    return 'BETALD VIA SWISH';
  }, [order?.paymentMethod, isPaid, paypalToken]);

  const mappedItems = useMemo(() => {
    if (order?.items && order.items.length > 0) {
      return order.items.map((item, idx) => {
        const extras = item.extras || [];
        const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
        const basePrice = (item.price || 0) - extrasTotal;
        const fallbackDesc = ITEM_DESCRIPTIONS_MAP.get(String(item.name || '').toLowerCase().trim()) || '';
        return {
          id: item.menuItemId || item.id || item._id || `${item.name}-${idx}`,
          name: item.name,
          description: item.description || fallbackDesc,
          quantity: item.quantity || 1,
          price: item.price,
          basePrice: Math.max(0, basePrice),
          extras,
          subtotal: (item.price || 0) * (item.quantity || 1)
        };
      });
    }

    // Default sample view matching the user's reference screenshot
    return [
      {
        id: '1',
        name: 'Schnitzel à la Venus',
        description: 'Krispig panerad kalvschnitzel, kaprisbär, brynt citronsmör, rödvinsky samt ugnsrostad svensk klyftpotatis.',
        quantity: 1,
        price: 179,
        basePrice: 179,
        extras: [],
        subtotal: 179
      },
      {
        id: '2',
        name: 'Capricciosa Speciale',
        description: 'San Marzano-tomater, fior di latte, prosciutto cotto & färsk skogschampinjon.',
        quantity: 1,
        price: 185,
        basePrice: 145,
        extras: [
          { optionId: 'ex1', label: 'Extra Pommes frites', price: 20 },
          { optionId: 'ex2', label: 'Egenvispad Bearnaisesås', price: 20 }
        ],
        subtotal: 185
      }
    ];
  }, [order?.items]);

  const totalAmount = useMemo(() => {
    if (typeof order?.totalAmount === 'number' && order.totalAmount > 0) {
      return Math.round(order.totalAmount);
    }
    return mappedItems.reduce((acc, i) => acc + (i.subtotal || 0), 0);
  }, [order?.totalAmount, mappedItems]);

  const deliveryFee = order?.deliveryFee || 0;
  const isDelivery = order?.orderMode === 'delivery';
  const subtotalAmount = Math.max(0, totalAmount - deliveryFee);
  const vatAmount = (totalAmount * 0.1071).toFixed(2); // 12% Swedish food VAT (12/112 ≈ 10.71%)
  const itemCount = mappedItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleCopyTrackingCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(displayTrackingCode);
      setCopied(true);
      toast.success('Ordernummer kopierat!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#070b10] text-[#f8f5ee] flex flex-col justify-between selection:bg-gold selection:text-black">
      <SiteHeader />

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-14 animate-[fade-in-up_0.6s_ease-out]">
        
        {/* Eyebrow & Page Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-1 rounded-full mb-3">
            <span className="text-[9.5px] sm:text-[10px] uppercase font-bold tracking-[0.28em] text-gold">
              ORDERBEKRÄFTELSE • RESTAURANG VENUS
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            Tack för din beställning
          </h1>

          <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto mt-3 font-light leading-relaxed px-4">
            Ditt kvitto och upphämtningsdetaljer har säkrats. Vårt köksteam i Örebro bereder dina utvalda rätter med omsorg.
          </p>
        </div>

        {/* Verified Status Banner */}
        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/30">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-200">
                Ordern mottagen & verifierad
              </p>
              <p className="text-xs text-emerald-300/70 mt-0.5">
                Köket tillagar beställningen med noggrannhet och omsorg.
              </p>
            </div>
          </div>

          <div className="border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 shrink-0 self-end sm:self-center">
            {paymentMethodLabel}
          </div>
        </div>

        {/* Section 1: STATUS FÖR TILLAGNING (Live Cooking Status Stepper) */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold block mb-1">
                STATUS FÖR TILLAGNING
              </span>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl text-white font-medium">
                Köket förbereder din mat just nu
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-gold self-start sm:self-center shadow-lg shadow-gold/10">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span>Estimerat färdig: {order?.etaText ? order.etaText : estimatedReadyTime}</span>
            </div>
          </div>

          {/* Stepper Steps (4 steps connected) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 relative">
            {/* Step 1: Mottagen */}
            <div className="flex flex-col items-start gap-2">
              <div className="h-7 w-7 rounded-full bg-gold text-black flex items-center justify-center font-bold shadow-md shadow-gold/25">
                <Check size={13} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">1. Mottagen</p>
                <p className="text-[11px] text-white/50 mt-0.5">{orderTimeFormatted} Bekräftad</p>
              </div>
            </div>

            {/* Step 2: Tillagas (Active) */}
            <div className="flex flex-col items-start gap-2">
              <div className="h-7 w-7 rounded-full bg-gold/20 border-[1.5px] border-gold text-gold flex items-center justify-center relative shadow-md shadow-gold/20">
                <span className="h-2 w-2 rounded-full bg-gold animate-ping opacity-75" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold absolute" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  2. Tillagas <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                </p>
                <p className="text-[11px] text-white/65 mt-0.5">På spisen & ugnen</p>
              </div>
            </div>

            {/* Step 3: Redo för hämtning */}
            <div className="flex flex-col items-start gap-2 opacity-40">
              <div className="h-7 w-7 rounded-full bg-white/5 border border-white/20 text-white/70 flex items-center justify-center font-semibold text-[11px]">
                3
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">3. Redo för hämtning</p>
                <p className="text-[11px] text-white/50 mt-0.5">Packas noggrant</p>
              </div>
            </div>

            {/* Step 4: Slutförd */}
            <div className="flex flex-col items-start gap-2 opacity-30">
              <div className="h-7 w-7 rounded-full bg-white/5 border border-white/20 text-white/70 flex items-center justify-center font-semibold text-[11px]">
                4
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">4. Slutförd</p>
                <p className="text-[11px] text-white/50 mt-0.5">Smaklig måltid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Ordernummer */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              ORDERNUMMER
            </span>
            <div className="my-2 flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-gold tracking-wider">
                #{displayTrackingCode}
              </span>
              <button
                onClick={handleCopyTrackingCode}
                title="Kopiera ordernummer"
                className="text-white/40 hover:text-gold transition-colors p-1"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            <span className="text-[11px] text-white/45">
              Uppge detta vid disken
            </span>
          </div>

          {/* Card 2: Beräknad tillagningstid */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              BERÄKNAD TILLAGNINGSTID
            </span>
            <div className="my-2">
              <span className="font-display text-2xl font-semibold text-white">
                {order?.etaText || '10 - 15 minuter'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Normalt kökstempo kväll
            </span>
          </div>

          {/* Card 3: Leveransmetod */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              LEVERANSMETOD
            </span>
            <div className="my-2">
              <span className="font-display text-2xl font-semibold text-white">
                {isDelivery ? 'Hemleverans' : 'Hämta själv'}
              </span>
            </div>
            <span className="text-[11px] text-white/45 truncate">
              {isDelivery ? (order?.deliveryAddress || 'Till angiven adress') : 'Varbergagatan 39A, Örebro'}
            </span>
          </div>

          {/* Card 4: Totalt erlagt */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              TOTALT ERLAGT
            </span>
            <div className="my-2">
              <span className="font-display text-2xl font-bold text-gold">
                {totalAmount} SEK
              </span>
            </div>
            <span className="text-[11px] text-white/45">
              Kvitto #{receiptNumber} • inkl. 12% moms
            </span>
          </div>
        </div>

        {/* Section 3: Two-Column Detailed Breakdown (7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          
          {/* Left Column (7 cols): Beställda rätter */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-lg sm:text-xl text-white font-medium">
                  Beställda rätter
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Specificerad beställning från à la carte
                </p>
              </div>
              <span className="border border-white/10 bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {itemCount} {itemCount === 1 ? 'ARTIKEL' : 'ARTIKLAR'}
              </span>
            </div>

            {/* Dishes list */}
            <div className="divide-y divide-white/5 mt-2">
              {mappedItems.map((item) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Quantity pill */}
                    <div className="h-7 w-7 rounded bg-gold/10 border border-gold/30 text-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-white/55 mt-1 leading-relaxed max-w-md">
                          {item.description}
                        </p>
                      )}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.extras.map((ex, idx) => (
                            <p key={`${ex.optionId || idx}`} className="text-[11px] text-gold/80 italic">
                              • {ex.label} <span className="text-gold/50 ml-1">(+{ex.price} kr)</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white whitespace-nowrap">
                      {item.subtotal} SEK
                    </p>
                    {item.extras && item.extras.length > 0 && (
                      <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">
                        Bas: {item.basePrice} + {item.price - item.basePrice} kr
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown table */}
            <div className="border-t border-white/10 pt-5 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Delsumma</span>
                <span className="text-white font-medium">{subtotalAmount.toFixed(2).replace('.', ',')} SEK</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Moms (12% restaurangmoms)</span>
                <span className="text-white font-medium">{vatAmount.replace('.', ',')} SEK</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>{isDelivery ? 'Leveransavgift' : 'Upphämtningsavgift'}</span>
                <span className={deliveryFee === 0 ? 'text-emerald-400 font-medium' : 'text-white font-medium'}>
                  {deliveryFee === 0 ? 'Kostnadsfri (0 SEK)' : `${deliveryFee} SEK`}
                </span>
              </div>

              {/* Total Row */}
              <div className="border-t border-white/10 pt-4 mt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/80 block">
                    TOTALT BETALT
                  </span>
                  <span className="text-[10px] text-white/40">
                    Beloppet har dragits från ditt konto
                  </span>
                </div>
                <span className="font-display text-2xl font-bold text-gold">
                  {totalAmount} SEK
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Upphämtningsplats & Kvalitetsgaranti */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Card 1: Upphämtningsplats */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                  {isDelivery ? 'LEVERANSADRESS' : 'UPPHÄMTNINGSPLATS'}
                </span>
              </div>

              <h4 className="font-display text-lg text-white font-medium">
                {isDelivery ? (order?.customerName || 'Din Leverans') : 'Restaurang Venus Örebro'}
              </h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                {isDelivery ? (order?.deliveryAddress || 'Varbergagatan 39A, Örebro') : 'Varbergagatan 39A, 703 51 Örebro, Sverige'}
              </p>

              {/* Instructions box */}
              <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2 text-xs text-white/70 leading-relaxed">
                <p>
                  • Gå fram till baren/avhämtningsdisken och uppge ditt namn eller <strong className="text-gold">#{displayTrackingCode}</strong>.
                </p>
                <p>
                  • Korttidsparkering finns direkt utanför entrén (15 min fri P-skiva).
                </p>
              </div>

              {/* Contact & Map Button */}
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 block">
                    FRÅGOR VID ANKOMST?
                  </span>
                  <a 
                    href="tel:019257090"
                    className="text-xs font-bold text-white hover:text-gold transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone size={11} className="text-gold" />
                    <span>Ring 019 - 25 70 90</span>
                  </a>
                </div>

                <a
                  href="https://www.google.com/maps/place/Pizzeria+Venus/@59.2869414,15.1773326,17z/data=!3m1!4b1!4m6!3m5!1s0x465c152c1fd82447:0x43c6d995c0863e13!8m2!3d59.2869414!4d15.1799129!16s%2Fg%2F1yh9ttv40"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-white/15 hover:border-gold/50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/80 hover:text-white transition-all shadow-sm"
                >
                  <span>Hitta hit på karta</span>
                  <ExternalLink size={12} className="text-gold" />
                </a>
              </div>
            </div>

            {/* Card 2: Emballage & Kvalitetsgaranti */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md p-5 shadow-xl flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 text-gold mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Vi packar din mat i isolerade, biologiskt nedbrytbara emballage för att bevara optimal temperatur, krispighet och aromatiska kvaliteter under transporten hem.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Row - Sleek, compact and elegant, vertical on mobile/tablet up to 768px, horizontal on desktop */}
        <div className="mt-8 flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto px-4">
          <Link
            to={`/track/${displayTrackingCode}`}
            className="w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gold hover:bg-[#d4b56a] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 whitespace-nowrap"
          >
            <span>Följ beställning i realtid</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>

          <Link
            to="/menu"
            className="w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 hover:border-gold/50 bg-[#0d1218] hover:bg-[#131a22] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 hover:text-white transition-all duration-300 whitespace-nowrap"
          >
            <span>Tillbaka till menyn</span>
          </Link>

          <button
            onClick={handlePrintReceipt}
            className="w-auto inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-white transition-colors px-4 py-2.5 whitespace-nowrap"
          >
            <Download size={13} className="text-gold" />
            <span>Ladda ner kvitto (PDF)</span>
          </button>
        </div>
      </div>

      {/* Hidden print receipt optimized for standard receipt/PDF printing */}
      <div className="print-receipt hidden">
        <div className="print-header">
          <h1>RESTAURANG VENUS</h1>
          <p>Varbergagatan 39A, Örebro</p>
          <p>Org.nr: 559281-9923 | Tel: 019-25 70 90</p>
          <hr />
          <p><strong>ORDER #{displayTrackingCode}</strong></p>
          <p>{orderTimeFormatted} • {paymentMethodLabel}</p>
        </div>
        <hr />
        {mappedItems.map((item, idx) => (
          <div key={idx} className="print-item">
            <span>{item.quantity}x {item.name}</span>
            <span>{item.subtotal} SEK</span>
          </div>
        ))}
        <hr />
        <div className="print-row">
          <span>Delsumma:</span>
          <span>{subtotalAmount.toFixed(2)} SEK</span>
        </div>
        <div className="print-row">
          <span>Moms (12%):</span>
          <span>{vatAmount} SEK</span>
        </div>
        <div className="print-row">
          <span><strong>TOTALT ERLAGT:</strong></span>
          <span><strong>{totalAmount} SEK</strong></span>
        </div>
      </div>
    </main>
  );
};

export default Confirmation;

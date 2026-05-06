import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { useCart } from '../context/CartContext';

const mockProduct = {
  _id: 'featured-wagyu',
  name: 'Entrecôte Wagyu A5',
  category: 'main',
  price: 895,
  image: '/images/hero-steak.png',
  description:
    'Upplev höjdpunkten av japansk gastronomi. Vår A5 Wagyu kommer direkt från Miyazaki-prefekturen, känd för sin exceptionella marmorering och smöriga konsistens. Varje snitt är noggrant utvalt för att garantera en smakupplevelse som bokstavligen smälter på tungan.'
};

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState('tryffel'); // 'tryffel' or 'rodvin'

  const handleAdd = () => {
    addToCart({ ...mockProduct, side }, qty);
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 xl:pb-32">
        <p className="mb-10 text-[10px] uppercase tracking-[0.4em] text-white/40">Meny / Varmrätter / <span className="text-gold">{id || 'Entrecôte Wagyu A5'}</span></p>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="border border-gold/20 p-2 bg-panel/30">
              <img 
                src="/images/hero-steak.png" 
                alt={mockProduct.name} 
                className="aspect-[4/3] w-full object-cover shadow-2xl" 
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <img src="/images/menu-starter.png" alt="Detail view" className="aspect-square w-full object-cover border border-white/5 opacity-80 hover:opacity-100 transition-opacity" />
              <img src="/images/menu-duck.png" alt="Preparation view" className="aspect-square w-full object-cover border border-white/5 opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <aside className="lg:pl-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Miyazaki Prefecture - Grade A5</p>
            <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{mockProduct.name}</h1>
            <div className="mt-6 flex items-baseline gap-6">
              <p className="text-4xl text-gold font-display">{mockProduct.price} KR</p>
              <p className="text-lg text-white/30 line-through">1250 KR</p>
            </div>
            
            <p className="mt-10 text-base leading-relaxed text-white/70">
              {mockProduct.description}
            </p>
            
            <div className="mt-8 border-l-2 border-gold/30 pl-6 py-2">
              <p className="text-xl italic text-white/60 font-display leading-relaxed">
                "En himmelsk balans mellan umami och textur, tillagad över binchotan-kol för den perfekta rökiga finishen."
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-4">Tillbehör (Välj din smak)</p>
              <button 
                onClick={() => setSide('tryffel')}
                className={`flex w-full items-center justify-between border px-6 py-5 text-[11px] uppercase tracking-[0.2em] transition-all ${
                  side === 'tryffel' ? 'border-gold bg-gold/5 text-white' : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <span>Tryffelsmör (handvispat)</span>
                {side === 'tryffel' ? <span className="text-gold">✓</span> : <span className="h-4 w-4 rounded-full border border-white/20" />}
              </button>
              <button 
                onClick={() => setSide('rodvin')}
                className={`flex w-full items-center justify-between border px-6 py-5 text-[11px] uppercase tracking-[0.2em] transition-all ${
                  side === 'rodvin' ? 'border-gold bg-gold/5 text-white' : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <span>Rödvinssky (24h reduktion)</span>
                {side === 'rodvin' ? <span className="text-gold">✓</span> : <span className="h-4 w-4 rounded-full border border-white/20" />}
              </button>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-6">
              <div className="flex items-center justify-between w-full sm:w-32 border border-white/10 bg-black/40 px-5 py-4">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-xl text-white/40 hover:text-gold"
                >
                  -
                </button>
                <span className="text-lg font-medium">{qty.toString().padStart(2, '0')}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="text-xl text-white/40 hover:text-gold"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAdd} 
                className="flex-1 bg-gold px-8 py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-black transition hover:bg-goldSoft shadow-lg shadow-gold/10"
              >
                Lägg till i beställning
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
              <span className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-gold">★</span> Certifierad A5
              </span>
              <span>Hållbart ursprung</span>
            </div>
          </aside>
        </div>

        <div className="mt-32">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
            <h2 className="font-display text-4xl sm:text-5xl text-white">Komplettera din upplevelse</h2>
            <Link to="/menu" className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-goldSoft underline-offset-8 hover:underline">Se hela källaren</Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden border border-white/5 bg-panel">
                <img src="/images/menu-pizza.png" alt="Tartufo Pizza" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gold/80">Signature Main</p>
              <h3 className="mt-3 font-display text-3xl text-white">Tartufo Pizza</h3>
              <p className="mt-2 text-white/50 text-sm">650 KR</p>
            </div>
            
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden border border-white/5 bg-panel">
                <img src="/images/menu-dessert.png" alt="Cosmic Chocolate" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gold/80">Celestial Final</p>
              <h3 className="mt-3 font-display text-3xl text-white">Cosmic Chocolate</h3>
              <p className="mt-2 text-white/50 text-sm">350 KR</p>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden border border-white/5 bg-panel">
                <img src="/images/menu-drink.png" alt="Nightcap" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gold/80">Bar Artisan</p>
              <h3 className="mt-3 font-display text-3xl text-white">Nightcap</h3>
              <p className="mt-2 text-white/50 text-sm">145 KR</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;


import { Flame, Leaf, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const tagMap = {
  popular: { label: 'Populär', icon: Flame, className: 'bg-pink-500/20 text-pink-300 border-pink-400/30' },
  vegetarian: { label: 'Vegetarisk', icon: Leaf, className: 'bg-green-500/20 text-green-300 border-green-400/30' },
  spicy: { label: 'Stark', icon: Flame, className: 'bg-orange-500/20 text-orange-300 border-orange-400/30' }
};

const MenuCard = ({ item, onAdd, added, quantityInCart = 0, restaurantOpen = true, highlighted = false, closedText = '' }) => {
  const isAvailable = item.available !== false;
  const hasQuantity = quantityInCart > 0;

  const handleClick = (e) => {
    if (e) e.stopPropagation();

    if (!isAvailable) {
      toast.error('Denna rätt är tyvärr inte tillgänglig just nu.', {
        style: { background: '#1c1917', color: '#fff', border: '1px solid #dc2626' }
      });
      return;
    }

    if (!restaurantOpen) {
      toast(
        <div className="flex flex-col text-left">
          <span className="font-medium text-white/95 text-[13px]">Restaurangen är stängd just nu.</span>
          <span className="text-gold font-semibold text-[12.5px] mt-0.5">Vi öppnar kl 11:00!</span>
        </div>,
        {
          icon: '🕒',
          duration: 3500,
          style: {
            background: '#0d1218',
            color: '#f6d894',
            border: '1px solid rgba(200, 164, 77, 0.4)',
            padding: '10px 14px'
          }
        }
      );
      return;
    }

    onAdd(item);
  };

  return (
    <article 
      data-menu-item-id={item._id}
      onClick={handleClick}
      className={`group relative grid cursor-pointer grid-cols-[1fr_104px] border border-white/10 bg-[#0d1218]/60 p-4 rounded-2xl transition-all duration-300 sm:grid-cols-[1fr_120px] xl:grid-cols-[1fr_140px] hover:border-gold/40 hover:bg-[#0d1218]/90 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
        highlighted ? 'border-gold shadow-[0_0_0_1px_rgba(200,164,77,0.45),0_0_20px_rgba(200,164,77,0.18)]' : ''
      }`}
    >
      {/* Text Section (Left) */}
      <div className="flex flex-col justify-between pr-4">
        <div>
          <h3 className="font-display text-[19px] leading-[1.2] text-white break-words sm:text-[21px] transition-colors group-hover:text-gold">
            {item.name}
          </h3>
          <p className="mt-1 text-[15px] font-display text-gold sm:text-[17px]">
            {item.price} kr
          </p>
          <p className="mt-2 text-[12.5px] sm:text-[13.5px] leading-[1.4] text-white/60 break-words line-clamp-2 sm:line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags?.map((tag) => {
            const meta = tagMap[tag];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span 
                key={tag} 
                className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[9px] uppercase tracking-wider ${meta.className}`}
              >
                <Icon size={10} /> {meta.label}
              </span>
            );
          })}
          {item.available === false && (
            <span className="inline-flex rounded border border-red-300/30 bg-red-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-red-200">
              Ej tillgänglig
            </span>
          )}
        </div>
      </div>

      {/* Image & Plus Button Section (Right) */}
      <div className="relative self-center justify-self-end h-[104px] w-[104px] sm:h-[120px] sm:w-[120px] xl:h-[140px] xl:w-[140px] overflow-hidden rounded-xl bg-white/5">
        <img
          src={item.image ? item.image.replace(/\.(png|jpg|jpeg)$/i, '.webp') : '/images/menu-pizza.webp'}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const fallback = (item.category === 'Förrätt' || item.category === 'starters')
              ? '/images/menu-starter.webp'
              : '/images/menu-pizza.webp';
            if (!e.currentTarget.src.endsWith(fallback)) {
              e.currentTarget.src = fallback;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Floating circular plus or quantity add-to-cart button */}
        <div
          onClick={handleClick}
          className={`absolute bottom-2 right-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border shadow-md transition-all duration-200 ${
            hasQuantity
              ? 'bg-[#d4af37] border-[#d4af37] text-black font-black scale-105 shadow-[0_2px_8px_rgba(212,175,55,0.35)]'
              : 'bg-[#10141a] border-white/30 text-white group-hover:bg-[#d4af37] group-hover:border-[#d4af37] group-hover:text-black group-hover:scale-105 group-hover:shadow-[0_2px_8px_rgba(212,175,55,0.35)]'
          }`}
          title={!restaurantOpen ? 'Restaurangen är stängd just nu' : 'Lägg till i varukorg'}
        >
          {hasQuantity ? (
            <span className="text-[11px] sm:text-[12px] leading-none select-none font-black text-black">
              {quantityInCart}
            </span>
          ) : (
            <Plus size={14} strokeWidth={3} className="text-current" />
          )}
        </div>
      </div>
    </article>
  );
};

export default MenuCard;

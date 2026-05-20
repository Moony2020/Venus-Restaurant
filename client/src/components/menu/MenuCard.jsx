import { Flame, Leaf } from 'lucide-react';

const tagMap = {
  popular: { label: 'Populär', icon: Flame, className: 'bg-pink-500/20 text-pink-300 border-pink-400/30' },
  vegetarian: { label: 'Vegetarisk', icon: Leaf, className: 'bg-green-500/20 text-green-300 border-green-400/30' },
  spicy: { label: 'Stark', icon: Flame, className: 'bg-orange-500/20 text-orange-300 border-orange-400/30' }
};

const MenuCard = ({ item, onAdd, added, quantityInCart = 0, restaurantOpen = true, highlighted = false }) => {
  const disabled = !restaurantOpen || item.available === false;
  const hasQuantity = quantityInCart > 0;

  return (
    <article 
      data-menu-item-id={item._id}
      onClick={() => !disabled && onAdd(item)}
      className={`group relative grid cursor-pointer grid-cols-[1fr_104px] border border-white/10 bg-[#0d1218]/45 p-4 rounded-2xl backdrop-blur-[2px] transition-all duration-300 sm:grid-cols-[1fr_120px] xl:grid-cols-[1fr_140px] ${
        highlighted ? 'border-gold shadow-[0_0_0_1px_rgba(200,164,77,0.45),0_0_20px_rgba(200,164,77,0.18)]' : ''
      } ${disabled ? 'opacity-45' : 'hover:border-gold/40 hover:bg-white/[0.04] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]'}`}
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
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Floating circular plus or quantity add-to-cart button */}
        <div
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-all duration-300 ${
            disabled
              ? 'cursor-not-allowed border-white/10 bg-black/80 text-white/40'
              : hasQuantity
                ? `border-gold/45 bg-gold text-black font-bold ${added ? 'scale-110' : ''}`
                : 'border-white/20 bg-black/75 text-white hover:border-gold hover:text-gold hover:bg-black/90'
          }`}
        >
          <span className="text-[14px] leading-none select-none font-bold">
            {hasQuantity ? quantityInCart : '+'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default MenuCard;

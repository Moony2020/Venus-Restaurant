import { Flame, Leaf } from 'lucide-react';

const tagMap = {
  popular: { label: 'Populär', icon: Flame, className: 'bg-pink-500/15 text-pink-300 border-pink-400/30' },
  vegetarian: { label: 'Vegetarisk', icon: Leaf, className: 'bg-green-500/15 text-green-300 border-green-400/30' },
  spicy: { label: 'Stark', icon: Flame, className: 'bg-orange-500/15 text-orange-300 border-orange-400/30' }
};

const MenuCard = ({ item, onAdd, added, restaurantOpen = true, highlighted = false }) => {
  const disabled = !restaurantOpen || item.available === false;
  return (
    <article 
      data-menu-item-id={item._id}
      onClick={() => !disabled && onAdd(item)}
      className={`group relative grid cursor-pointer grid-cols-[1fr_104px] border border-gold/20 bg-white/[0.03] p-4 rounded-2xl backdrop-blur-[2px] transition-all duration-300 sm:grid-cols-[1fr_120px] xl:grid-cols-[1fr_145px] ${
        highlighted ? 'border-gold shadow-[0_0_0_1px_rgba(200,164,77,0.45),0_0_20px_rgba(200,164,77,0.18)]' : ''
      } ${disabled ? 'opacity-45' : 'hover:border-gold/50 hover:bg-white/[0.05]'}`}
    >
      <div className="pr-3">
        <h3 className="text-[20px] font-display leading-[1.15] text-white break-words sm:text-[22px] transition-colors">{item.name}</h3>
        <p className="mt-1 text-[16px] leading-none text-gold sm:text-[18px]">från {item.price} kr</p>
        <p className="mt-2 text-[14px] leading-[1.35] text-white/70 break-words sm:text-[15px]">{item.description}</p>

        {item.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.map((tag) => {
              const meta = tagMap[tag];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span key={tag} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${meta.className}`}>
                  <Icon size={11} /> {meta.label}
                </span>
              );
            })}
          </div>
        )}
        {item.available === false && (
          <span className="mt-3 inline-flex rounded border border-red-300/30 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">
            Ej tillgänglig
          </span>
        )}
      </div>

      <div className="relative self-center justify-self-end">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-[104px] w-[104px] rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[116px] sm:w-[116px] xl:h-[145px] xl:w-[145px]"
        />
        <div
          className={`absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full border text-lg shadow-lg transition-all duration-300 ${
            disabled
              ? 'cursor-not-allowed border-white/20 bg-[#111827] text-white/40'
              : added
                ? 'scale-110 border-gold bg-gold text-black'
                : 'border-white/30 bg-[#111827] text-white group-hover:border-gold group-hover:text-gold'
          }`}
        >
          {added ? '✓' : '+'}
        </div>
      </div>
    </article>
  );
};

export default MenuCard;

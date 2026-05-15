import { useState, useEffect, useRef } from 'react';
import { X, Minus, Plus, Info, ChevronDown, ChevronUp } from 'lucide-react';

const ItemModal = ({ item, isOpen, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [availabilityAction, setAvailabilityAction] = useState('remove');
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef(null);

  // Reset state when a new item is opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
      setExpandedGroups({});
      setAvailabilityAction('remove');
      setIsActionDropdownOpen(false);
      setIsScrolled(false);
      // Do not auto-select required options. The user must explicitly choose.
      setSelectedOptions({});
    }
  }, [isOpen, item]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 280);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleCheckbox = (groupId, optionId) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      } else {
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  const handleSelectRadio = (groupId, optionId) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
  };

  const calculateTotalPrice = () => {
    let base = item.price;
    if (item.customizations) {
      item.customizations.forEach(group => {
        const selected = selectedOptions[group.id];
        if (group.type === 'radio') {
          const opt = group.options.find(o => o.id === selected);
          if (opt?.price) base += opt.price;
        } else if (group.type === 'checkbox' && Array.isArray(selected)) {
          selected.forEach(id => {
            const opt = group.options.find(o => o.id === id);
            if (opt?.price) base += opt.price;
          });
        }
      });
    }
    return base * quantity;
  };

  const handleAdd = () => {
    const extrasList = [];
    Object.entries(selectedOptions).forEach(([groupId, selected]) => {
      const group = item.customizations.find((g) => g.id === groupId);
      if (!group) return;

      if (group.type === 'radio') {
        const opt = group.options.find((o) => o.id === selected);
        if (opt) {
          extrasList.push({
            label: opt.label,
            price: opt.price || 0,
            groupId: group.id,
            optionId: opt.id
          });
        }
      } else if (group.type === 'checkbox' && Array.isArray(selected)) {
        selected.forEach((id) => {
          const opt = group.options.find((o) => o.id === id);
          if (opt) {
            extrasList.push({
              label: opt.label,
              price: opt.price || 0,
              groupId: group.id,
              optionId: opt.id
            });
          }
        });
      }
    });

    const customItem = {
      ...item,
      id: `${item._id || item.id}-${Date.now()}`,
      cartItemId: `${item._id || item.id}-${Date.now()}`,
      quantityToAdd: quantity,
      notes,
      availabilityAction,
      selectedOptions,
      extras: extrasList,
      basePrice: Number(item.price) || 0,
      price: calculateTotalPrice()
    };
    onAdd(customItem);
    onClose();
  };

  const isAddToCartDisabled = item?.customizations?.some(
    group => group.required && (!selectedOptions[group.id] || (Array.isArray(selectedOptions[group.id]) && selectedOptions[group.id].length === 0))
  );

  const totalPrice = calculateTotalPrice();

  return (
    <>
      <div 
        className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xl transition-opacity duration-500 ease-in-out" 
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-[301] flex max-h-[94vh] flex-col overflow-hidden rounded-t-[2.5rem] bg-[#0a0f14]/95 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:w-[560px] sm:max-w-[95vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl">
        
        {/* Sticky/Absolute Header Overlay */}
        <div className={`absolute left-0 right-0 top-0 z-[310] flex shrink-0 items-center justify-between px-6 py-2.5 transition-all duration-500 sm:px-8 ${
          isScrolled 
            ? 'bg-[#0a0f14]/90 backdrop-blur-2xl border-b border-white/5 shadow-lg' 
            : 'bg-transparent'
        }`}>
          <h2 className={`font-display text-xl sm:text-2xl font-medium tracking-tight transition-all duration-500 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            {item.name}
          </h2>
          <button 
            onClick={onClose}
            className={`group flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
              isScrolled 
                ? 'bg-white/10 text-white/60 border-white/10' 
                : 'bg-black/30 text-white/80 border-white/5 backdrop-blur-md'
            }`}
          >
            <X size={16} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
        >
          {/* Image Section */}
          {item.image && (
            <div className="relative h-64 w-full sm:h-72">
              <img 
                src={item.image} 
                alt={item.name} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent" />
            </div>
          )}

          <div className="px-6 pb-8 pt-4 sm:px-8">
            {/* Title & Description */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">{item.name}</h2>
                <button className="mt-1 text-white/40 hover:text-gold transition-colors">
                  <Info size={20} />
                </button>
              </div>
              <p className="mt-2 text-xl font-medium text-gold">{item.price} kr</p>
              {item.description && (
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>
              )}
            </div>

            {/* Customization Sections */}
            {item.customizations?.map((group) => {
              const isExpanded = expandedGroups[group.id];
              const visibleOptions = isExpanded ? group.options : group.options.slice(0, 5);
              const hasMore = group.options.length > 5;

              return (
                <div key={group.id} className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-5 py-4 sm:px-6">
                    <div>
                      <h3 className="text-lg font-display tracking-tight text-white">{group.label}</h3>
                      {group.description && <p className="mt-0.5 text-xs text-white/40">{group.description}</p>}
                    </div>
                    {group.required ? (
                      <span className="rounded-full bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-400 border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">Krävs</span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10">Valfritt</span>
                    )}
                  </div>

                  <div className="divide-y divide-white/5">
                    {visibleOptions.map((opt) => (
                      <label 
                        key={opt.id} 
                        className="flex cursor-pointer items-center justify-between px-5 py-4 transition-all hover:bg-white/5 active:bg-white/[0.08] sm:px-6 group"
                        onClick={() => group.type === 'radio' ? handleSelectRadio(group.id, opt.id) : handleToggleCheckbox(group.id, opt.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`relative flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-all duration-300 ${
                            group.type === 'radio' ? 'rounded-full' : 'rounded-lg'
                          } ${
                            (group.type === 'radio' ? selectedOptions[group.id] === opt.id : (selectedOptions[group.id] || []).includes(opt.id))
                              ? 'border-gold bg-gold shadow-[0_0_15px_rgba(200,164,77,0.4)]'
                              : 'border-white/10 bg-white/5 group-hover:border-gold/40'
                          }`}>
                            {(group.type === 'radio' ? selectedOptions[group.id] === opt.id : (selectedOptions[group.id] || []).includes(opt.id)) && (
                              <div className={`bg-black transition-all duration-300 ${
                                group.type === 'radio' ? 'h-2 w-2 rounded-full' : 'h-3 w-3 rounded-[2px]'
                              }`} />
                            )}
                          </div>
                          <span className={`text-[15px] font-medium transition-colors duration-200 ${
                            (group.type === 'radio' ? selectedOptions[group.id] === opt.id : (selectedOptions[group.id] || []).includes(opt.id))
                              ? 'text-white'
                              : 'text-white/60 group-hover:text-white'
                          }`}>{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {opt.price > 0 && (
                            <span className="text-sm font-semibold text-gold/90 transition-colors group-hover:text-gold">+ {opt.price} kr</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {hasMore && (
                    <button 
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="flex w-full items-center justify-center gap-2 border-t border-white/5 bg-white/[0.01] py-4 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:bg-white/[0.03] hover:text-white"
                    >
                      {isExpanded ? (
                        <>Visa färre <ChevronUp size={14} /></>
                      ) : (
                        <>Visa {group.options.length - 5} till <ChevronDown size={14} /></>
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Special Requests Section */}
            <div className="mb-10">
              <div className="mb-4">
                <label className="font-display text-xl text-white">Allergier/önskemål</label>
                <p className="mt-1 text-xs text-white/40">Var noga med att ange om du har en allergi eller bara vill undvika någon viss typ av mat.</p>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="t.ex. ingen majonnäs"
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-[15px] text-white placeholder:text-white/20 transition-all focus:border-gold/40 focus:bg-white/[0.05] focus:outline-none focus:ring-0"
                rows={3}
              />
            </div>

            {/* Availability Action Section */}
            <div className="mb-10">
              <label className="mb-4 block font-display text-xl text-white">
                Om den här produkten inte är tillgänglig
              </label>
              <div className="relative">
                <button 
                  onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-2xl border transition-all duration-300 px-6 py-4 text-[15px] font-medium ${
                    isActionDropdownOpen 
                      ? 'border-gold bg-white/[0.08] shadow-[0_0_20px_rgba(200,164,77,0.1)]' 
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-white">
                    {availabilityAction === 'remove' ? 'Ta bort från min beställning' :
                     availabilityAction === 'cancel' ? 'Avbryt hela beställningen' :
                     'Ring mig'}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gold transition-transform duration-500 ${isActionDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isActionDropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d141b] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    {[
                      { id: 'remove', label: 'Ta bort från min beställning' },
                      { id: 'cancel', label: 'Avbryt hela beställningen' },
                      { id: 'call', label: 'Ring mig' }
                    ].map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          setAvailabilityAction(action.id);
                          setIsActionDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-6 py-4 text-[15px] font-medium transition-all hover:bg-white/[0.05] ${
                          availabilityAction === action.id ? 'text-gold' : 'text-white/60'
                        }`}
                      >
                        {action.label}
                        {availabilityAction === action.id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(200,164,77,0.8)]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-white/5 bg-[#0d141b]/80 p-6 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center gap-5">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 px-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
                disabled={quantity <= 1}
              >
                <Minus size={20} strokeWidth={2.5} />
              </button>
              <span className="w-10 text-center text-lg font-bold text-white">{quantity}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <button 
              onClick={handleAdd}
              disabled={isAddToCartDisabled}
              className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-bold uppercase tracking-[0.15em] transition-all ${
                isAddToCartDisabled
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gold text-black hover:scale-[1.02] active:scale-95'
              }`}
            >
              {!isAddToCartDisabled && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              )}
              <span>Lägg till i varukorg</span>
              <span className="mx-1 opacity-30 text-lg">•</span>
              <span>{totalPrice} kr</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemModal;

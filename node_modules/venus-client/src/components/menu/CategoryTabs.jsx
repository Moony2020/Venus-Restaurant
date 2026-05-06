import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCROLL_STEP = 320;

const CategoryTabs = ({ categories, activeCategory, onChange }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const node = scrollRef.current;
    if (!node) return;
    const maxLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 2);
    setCanScrollRight(maxLeft - node.scrollLeft > 2);
  };

  useEffect(() => {
    updateScrollState();
    const node = scrollRef.current;
    if (!node) return;

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    node.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      node.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [categories.length]);

  const hasOverflow = useMemo(() => canScrollLeft || canScrollRight, [canScrollLeft, canScrollRight]);

  const scrollByStep = (dir) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-[73px] z-30 border-y border-white/10 bg-[#0a0f14]/95 backdrop-blur">
      <div className="mx-auto w-[92vw] max-w-[2200px] px-4 py-3 lg:px-8">
        <div className="relative">
          {hasOverflow && (
            <>
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollByStep(-1)}
                  className="absolute -left-2 top-[46%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0a0f14]/95 text-white/85 backdrop-blur transition hover:border-gold hover:text-gold md:h-8 md:w-8 lg:-left-2"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={16} className="md:h-[16px] md:w-[16px]" />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollByStep(1)}
                  className="absolute -right-2 top-[46%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0a0f14]/95 text-white/85 backdrop-blur transition hover:border-gold hover:text-gold md:h-8 md:w-8 lg:-right-2"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight size={16} className="md:h-[16px] md:w-[16px]" />
                </button>
              )}
            </>
          )}

          <div
            ref={scrollRef}
            className={`flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              hasOverflow ? 'px-0 lg:px-3' : ''
            }`}
          >
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChange(category.id)}
                  className={`whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] ${
                    isActive
                      ? 'border-gold bg-gold text-black shadow-[0_0_0_1px_rgba(200,164,77,0.2)]'
                      : 'border-white/20 bg-white/5 text-white/75 hover:border-gold/50 hover:text-gold'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;

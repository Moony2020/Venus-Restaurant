import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCROLL_STEP = 320;

const CategoryTabs = ({ categories, activeCategory, onChange }) => {
  const scrollRef = useRef(null);
  const tabRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const node = scrollRef.current;
    if (!node) return;
    const maxLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(maxLeft - node.scrollLeft > 4);
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

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const run = () => {
      const activeButton = tabRefs.current[activeCategory];
      if (!activeButton) return;

      const nodeRect = node.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const currentLeft = node.scrollLeft;
      const deltaToCenter =
        (buttonRect.left + buttonRect.width / 2) - (nodeRect.left + nodeRect.width / 2);
      const maxLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      const targetLeft = Math.min(maxLeft, Math.max(0, currentLeft + deltaToCenter));

      node.scrollTo({ left: targetLeft, behavior: 'smooth' });
      updateScrollState();
    };

    const id = requestAnimationFrame(() => {
      run();
      setTimeout(run, 80);
    });

    return () => cancelAnimationFrame(id);
  }, [activeCategory, categories.length]);

  const hasOverflow = useMemo(() => canScrollLeft || canScrollRight, [canScrollLeft, canScrollRight]);

  const scrollByStep = (dir) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div data-category-tabs className="sticky top-[73px] z-30 border-y border-white/10 bg-[#0a0f14]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[2200px] px-3 py-2.5 lg:px-5 xl:px-5">
        <div className="relative">
          {hasOverflow && (
            <>
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollByStep(-1)}
                  className="absolute -left-1 sm:left-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0a0f14]/95 text-white shadow-xl backdrop-blur-md transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollByStep(1)}
                  className="absolute -right-1 sm:right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0a0f14]/95 text-white shadow-xl backdrop-blur-md transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  data-category-tab-id={category.id}
                  ref={(el) => {
                    if (el) tabRefs.current[category.id] = el;
                  }}
                  type="button"
                  onClick={() => onChange(category.id)}
                  className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-[0.18em] rounded-lg transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-gold text-black border border-gold shadow-[0_2px_12px_rgba(200,164,77,0.35)] font-bold'
                      : 'border border-white/15 bg-white/5 text-white/75 hover:border-gold/50 hover:bg-gold/10 hover:text-white font-medium'
                  }`}
                >
                  {category.label}
                  {typeof category.count === 'number' ? ` (${category.count})` : ''}
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

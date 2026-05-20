import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCROLL_STEP = 320;

const CategoryTabs = ({ categories, activeCategory, onChange }) => {
  const scrollRef = useRef(null);
  const tabRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

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

  useEffect(() => {
    const updateIndicator = () => {
      const activeTabEl = tabRefs.current[activeCategory];
      if (activeTabEl) {
        const left = activeTabEl.offsetLeft;
        const width = activeTabEl.offsetWidth;
        setIndicatorStyle({
          left: left,
          width: width,
          opacity: 1
        });
      }
    };

    updateIndicator();
    const id1 = setTimeout(updateIndicator, 50);
    const id2 = setTimeout(updateIndicator, 150);

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, [activeCategory, categories.length]);

  const hasOverflow = useMemo(() => canScrollLeft || canScrollRight, [canScrollLeft, canScrollRight]);

  const scrollByStep = (dir) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div data-category-tabs className="sticky top-[73px] z-30 border-y border-white/10 bg-[#0a0f14]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[2200px] px-8 py-3 lg:px-16">
        <div className="relative">
          {hasOverflow && (
            <>
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollByStep(-1)}
                  className="absolute -left-4 top-[40%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0a0f14]/90 text-white shadow-xl backdrop-blur-md transition-all hover:border-gold hover:text-gold lg:-left-10"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollByStep(1)}
                  className="absolute -right-4 top-[40%] z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0a0f14]/90 text-white shadow-xl backdrop-blur-md transition-all hover:border-gold hover:text-gold lg:-right-10"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          )}

          <div
            ref={scrollRef}
            className={`relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              hasOverflow ? 'px-12' : ''
            }`}
          >
            {/* Sliding Gold Indicator */}
            <div 
              className="absolute top-0 bottom-1 rounded-lg bg-gold shadow-lg shadow-gold/25 transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.25,1)] pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />

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
                  className={`relative z-10 whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] rounded-lg ${
                    isActive
                      ? 'border-transparent text-black font-semibold'
                      : 'border-white/20 bg-white/5 text-white/75 hover:border-gold/50 hover:text-gold'
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


import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnCarouselProps {
  children: React.ReactNode;
}

const ColumnCarousel: React.FC<ColumnCarouselProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // Buffer of 10px
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    checkScrollability();
    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const columnsContainer = el.firstElementChild;
    if (!columnsContainer) return;
    
    const columnWidth = 350; // Base column width
    const scrollAmount = direction === 'left' ? -columnWidth : columnWidth;
    
    el.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative flex w-full">
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border bg-background/80 shadow-md backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      <ScrollArea 
        className="w-full overflow-hidden" 
        orientation="horizontal"
      >
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-6 hide-scrollbar"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex gap-6 px-4">
            {children}
          </div>
        </div>
      </ScrollArea>
      
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border bg-background/80 shadow-md backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ColumnCarousel;

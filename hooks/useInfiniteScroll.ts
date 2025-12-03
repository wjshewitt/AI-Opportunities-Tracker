import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

interface UseInfiniteScrollOptions {
  itemsPerPage: number;
  totalItems: number;
}

interface UseInfiniteScrollReturn {
  visibleCount: number;
  sentinelRef: RefObject<HTMLDivElement>;
  resetScroll: () => void;
}

export function useInfiniteScroll({ 
  itemsPerPage, 
  totalItems 
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const resetScroll = useCallback(() => {
    setVisibleCount(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < totalItems) {
          setVisibleCount(prev => Math.min(prev + itemsPerPage, totalItems));
        }
      },
      { rootMargin: '100px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleCount, totalItems, itemsPerPage]);

  return { visibleCount, sentinelRef, resetScroll };
}

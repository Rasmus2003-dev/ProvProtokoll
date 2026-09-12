import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const THRESHOLD = 75;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only pull if container is at the very top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    } else {
      isDragging.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    // If user scrolled down before pulling
    if (containerRef.current && containerRef.current.scrollTop > 0) {
      isDragging.current = false;
      setPullY(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply friction resistance curve
      const resistance = Math.min(diff * 0.45, 110);
      setPullY(resistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullY >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullY(60);

      // Perform soft/hard refresh to update PWA / cache
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.update();
          }
        }
      } catch (_) {}

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setPullY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 overflow-y-auto relative overscroll-contain"
    >
      {/* Pull Indicator */}
      <div
        style={{
          transform: `translateY(${pullY - 50}px)`,
          opacity: Math.min(pullY / 45, 1),
          transition: isDragging.current ? 'none' : 'transform 0.25s ease-out, opacity 0.2s ease-out'
        }}
        className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none"
      >
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
          <RefreshCw
            size={14}
            className={`text-[#002f6c] dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullY * 3}deg)`
            }}
          />
          <span>{isRefreshing ? 'Uppdaterar...' : pullY >= THRESHOLD ? 'Släpp för att uppdatera' : 'Dra neråt för att uppdatera'}</span>
        </div>
      </div>

      {/* Main Content with smooth spring return */}
      <div
        style={{
          transform: pullY > 0 ? `translateY(${pullY * 0.75}px)` : 'none',
          transition: isDragging.current ? 'none' : 'transform 0.25s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

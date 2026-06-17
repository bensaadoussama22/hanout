import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 68;

export default function PullToRefresh({ children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY === 0) {
        setPull(Math.min(dy * 0.42, THRESHOLD + 16));
      }
    };

    const onTouchEnd = () => {
      if (pull >= THRESHOLD) {
        setRefreshing(true);
        setPull(0);
        setTimeout(() => window.location.reload(), 700);
      } else {
        setPull(0);
      }
      startY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pull, refreshing]);

  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <>
      {/* Indicateur — fixed, pas de transform sur le contenu */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[480px] flex justify-center pointer-events-none z-[60]"
        style={{
          top: pull > 6 || refreshing ? Math.max(pull - 44, 10) : -52,
          transition: pull === 0 ? 'top 0.3s cubic-bezier(0.2,0,0,1)' : 'none',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(30,30,50,0.9)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            opacity: refreshing ? 1 : progress,
          }}
        >
          <RefreshCw
            size={17}
            className="text-white/80"
            style={{
              transform: refreshing ? undefined : `rotate(${progress * 220}deg)`,
              animation: refreshing ? 'ptr-spin 0.7s linear infinite' : 'none',
            }}
          />
        </div>
      </div>

      {children}

      <style>{`@keyframes ptr-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

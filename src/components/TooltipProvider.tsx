import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface HoverInfo {
  title: string;
  description: string;
  x: number;
  y: number;
  anchorX: number;
  side: 'top' | 'bottom';
  targetTop: number;
  targetBottom: number;
}

interface TooltipContextValue {
  showTooltip: (e: React.MouseEvent | { currentTarget: HTMLElement }, title: string, description: string) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextValue>({ 
  showTooltip: () => {}, 
  hideTooltip: () => {} 
});

export const useTooltip = () => useContext(TooltipContext);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent | { currentTarget: HTMLElement }, title: string, description: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const tooltipWidth = 256; 
    const padding = 12;

    let x = rect.left + rect.width / 2;
    const minX = (tooltipWidth / 2) + padding;
    const maxX = windowWidth - (tooltipWidth / 2) - padding;
    const clampedX = Math.max(minX, Math.min(maxX, x));

    setHoveredInfo({
      title,
      description,
      x: clampedX,
      y: rect.top - 10,
      anchorX: x,
      side: rect.top < 150 ? 'bottom' : 'top',
      targetTop: rect.top,
      targetBottom: rect.bottom
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      <AnimatePresence>
        {hoveredInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: hoveredInfo.side === 'top' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`fixed z-[1000] w-64 pointer-events-none lux-shadow`}
            style={{
              left: hoveredInfo.x,
              top: hoveredInfo.side === 'top' ? undefined : hoveredInfo.targetBottom + 10,
              bottom: hoveredInfo.side === 'top' ? (window.innerHeight - hoveredInfo.targetTop + 10) : undefined,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-black/90 backdrop-blur-md border border-bento-gold/50 p-3 rounded-sm relative shadow-2xl">
              <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
              <div className="text-bento-gold font-black italic uppercase tracking-tighter text-sm mb-1 border-b border-bento-gold/20 pb-1">
                {hoveredInfo.title}
              </div>
              <div className="text-bento-text-dim text-[10px] leading-relaxed italic font-serif">
                {hoveredInfo.description}
              </div>
              
              {/* Arrow */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-bento-gold/50 rotate-45 z-[-1]
                  ${hoveredInfo.side === 'top' ? '-bottom-1.5' : '-top-1.5 rotate-[225deg]'}
                `}
                style={{ left: `calc(50% + ${hoveredInfo.anchorX - hoveredInfo.x}px)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipContext.Provider>
  );
};

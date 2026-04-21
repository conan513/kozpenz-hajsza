import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface DamageNumberEntry {
  id: number;
  value: number;
  type: 'damage' | 'heal' | 'block' | 'energy';
  x: number;
  y: number;
}

interface DamageNumberContextValue {
  addNumber: (value: number, type: DamageNumberEntry['type'], x?: number, y?: number) => void;
}

const DamageNumberContext = createContext<DamageNumberContextValue>({ addNumber: () => {} });

export const useDamageNumber = () => useContext(DamageNumberContext);

let _id = 0;

export const DamageNumberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numbers, setNumbers] = useState<DamageNumberEntry[]>([]);
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const addNumber = useCallback((value: number, type: DamageNumberEntry['type'], x = 50, y = 50) => {
    const id = _id++;
    const jitter = (Math.random() - 0.5) * 60;
    setNumbers(prev => [...prev, { id, value, type, x: x + jitter, y }]);
    const t = setTimeout(() => {
      setNumbers(prev => prev.filter(n => n.id !== id));
      timeouts.current.delete(id);
    }, 1200);
    timeouts.current.set(id, t);
  }, []);

  const getColor = (type: DamageNumberEntry['type']) => {
    switch (type) {
      case 'damage': return '#ef4444';
      case 'heal':   return '#22c55e';
      case 'block':  return '#3b82f6';
      case 'energy': return '#0d9488';
    }
  };

  const getPrefix = (type: DamageNumberEntry['type']) => {
    switch (type) {
      case 'damage': return '-';
      case 'heal':   return '+';
      case 'block':  return '🛡';
      case 'energy': return '⚡';
    }
  };

  return (
    <DamageNumberContext.Provider value={{ addNumber }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[500]" style={{ userSelect: 'none' }}>
        <AnimatePresence>
          {numbers.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -70, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${n.x}px`,
                top: `${n.y}px`,
                color: getColor(n.type),
                fontFamily: 'Courier Prime, monospace',
                fontWeight: 900,
                fontSize: Math.min(28, 16 + Math.abs(n.value) / 3) + 'px',
                textShadow: `0 0 12px ${getColor(n.type)}, 0 2px 4px rgba(0,0,0,0.9)`,
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}
            >
              {getPrefix(n.type)}{Math.abs(n.value)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DamageNumberContext.Provider>
  );
};

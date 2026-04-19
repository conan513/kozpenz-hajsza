import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapNode } from '../types';
import { Sword, Skull, ShoppingCart, Coffee, HelpCircle, TowerControl } from 'lucide-react';

interface MapComponentProps {
  nodes: MapNode[];
  onNodeClick: (node: MapNode) => void;
  currentNodeId: string | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ nodes, onNodeClick, currentNodeId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when component mounts
    const timeout = setTimeout(() => {
      if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Start': return <TowerControl size={24} className="text-bento-gold" />;
      case 'Combat': return <Sword size={20} />;
      case 'Elite': return <Sword size={24} className="text-red-500" />;
      case 'Boss': return <Skull size={32} className="text-red-600" />;
      case 'Shop': return <ShoppingCart size={20} />;
      case 'Rest': return <Coffee size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[600px] md:h-[calc(100vh-250px)] bg-bento-bg rounded-xl border border-bento-border p-4 md:p-8 overflow-y-auto overflow-x-hidden shadow-2xl custom-scrollbar scroll-smooth">
      <div className="absolute top-0 left-0 w-full h-[2000px] opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
      
      {/* Set a massive inner container to allow scrolling */}
      <div className="relative w-full h-[2000px]">
          {/* Connections (Lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node => node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`}
                  y1={`${100 - node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${100 - target.y}%`}
                  stroke="var(--color-bento-text-dim)"
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  strokeDasharray="6 4"
                />
              );
            }))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const isActive = node.reachable;
            const isCurrent = node.id === currentNodeId;
            const isVisited = node.visited;

            return (
              <motion.button
                key={node.id}
                whileHover={isActive ? { scale: 1.2 } : {}}
                whileTap={isActive ? { scale: 0.9 } : {}}
                onClick={() => isActive && onNodeClick(node)}
                style={{ left: `${node.x}%`, bottom: `${node.y}%` }}
                className={`absolute -translate-x-1/2 translate-y-1/2 p-4 rounded-full border transition-all
                  ${isCurrent ? 'bg-bento-gold border-white z-10 shadow-[0_0_20px_rgba(246,173,85,0.4)]' : 
                    isActive ? 'bg-slate-800 border-white/20 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:border-white/50' : 
                    isVisited ? 'bg-slate-900 border-slate-700 opacity-50' : 
                    'bg-slate-950 border-slate-800 opacity-30 cursor-not-allowed'}
                `}
              >
                <div className={`${isActive ? 'text-white' : isCurrent ? 'text-black' : 'text-slate-500'}`}>
                  {getIcon(node.type)}
                </div>
                {isCurrent && (
                    <motion.div 
                        layoutId="pulse"
                        className="absolute -inset-1 border-2 border-bento-gold rounded-full pointer-events-none"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
              </motion.button>
            );
          })}
      </div>
    </div>
  );
};

export default MapComponent;

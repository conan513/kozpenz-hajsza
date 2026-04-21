import React from 'react';
import { motion } from 'motion/react';
import { MapNode } from '../types';
import { Sword, Skull, ShoppingCart, Coffee, HelpCircle, TowerControl, Zap } from 'lucide-react';

interface MapComponentProps {
  nodes: MapNode[];
  onNodeClick: (node: MapNode) => void;
  currentNodeId: string | null;
}

const NODE_META: Record<string, { label: string; color: string; size: number }> = {
  Start:   { label: 'Start',   color: '#d4af37', size: 28 },
  Combat:  { label: 'Harc',    color: '#ef4444', size: 24 },
  Elite:   { label: 'Elit',    color: '#dc2626', size: 28 },
  Boss:    { label: 'Főnök',   color: '#991b1b', size: 34 },
  Shop:    { label: 'Bolt',    color: '#10b981', size: 24 },
  Rest:    { label: 'Pihenő',  color: '#3b82f6', size: 24 },
  Mystery: { label: 'Titok',   color: '#a855f7', size: 24 },
};

const MapComponent: React.FC<MapComponentProps> = React.memo(({ nodes, onNodeClick, currentNodeId }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const getIcon = (type: string, size: number) => {
    switch (type) {
      case 'Start':   return <TowerControl size={size * 0.65} />;
      case 'Combat':  return <Sword size={size * 0.6} />;
      case 'Elite':   return <Zap size={size * 0.65} />;
      case 'Boss':    return <Skull size={size * 0.7} />;
      case 'Shop':    return <ShoppingCart size={size * 0.6} />;
      case 'Rest':    return <Coffee size={size * 0.6} />;
      default:        return <HelpCircle size={size * 0.6} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] md:h-[calc(100vh-250px)] bg-bento-bg rounded-sm border border-bento-border p-4 md:p-8 overflow-y-auto overflow-x-hidden lux-shadow custom-scrollbar scroll-smooth"
    >
      {/* Background texture */}
      <div className="absolute inset-0 paper-texture opacity-60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

      <div className="relative w-full h-[2000px]">
        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              const isActive = node.visited && target.reachable;
              return (
                <g key={`${node.id}-${targetId}`}>
                  {/* Glow underlay */}
                  <line
                    x1={`${node.x}%`} y1={`${100 - node.y}%`}
                    x2={`${target.x}%`} y2={`${100 - target.y}%`}
                    stroke={isActive ? '#d4af37' : '#522d2d'}
                    strokeWidth="5"
                    strokeOpacity="0.15"
                    filter="url(#line-glow)"
                  />
                  {/* Main line */}
                  <line
                    x1={`${node.x}%`} y1={`${100 - node.y}%`}
                    x2={`${target.x}%`} y2={`${100 - target.y}%`}
                    stroke={isActive ? '#d4af37' : '#b91c1c'}
                    strokeWidth={isActive ? 2.5 : 2}
                    strokeOpacity={node.visited ? 0.7 : 0.4}
                    strokeDasharray={target.visited ? '0' : '10 5'}
                    strokeLinecap="round"
                    className={isActive ? 'map-line-active' : ''}
                    style={isActive ? { strokeDasharray: '10 5', strokeDashoffset: 0 } : {}}
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const isActive  = node.reachable;
          const isCurrent = node.id === currentNodeId;
          const isVisited = node.visited;
          const meta = NODE_META[node.type] || NODE_META['Mystery'];
          const sz = meta.size;

          return (
            <motion.button
              key={node.id}
              whileHover={isActive ? { scale: 1.25 } : {}}
              whileTap={isActive ? { scale: 0.88 } : {}}
              onClick={() => isActive && onNodeClick(node)}
              style={{ left: `${node.x}%`, bottom: `${node.y}%` }}
              className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full border-2 transition-all flex items-center justify-center
                ${isCurrent
                  ? 'z-10 shadow-[0_0_24px_rgba(212,175,55,0.7)]'
                  : isActive
                  ? 'cursor-pointer shadow-[0_0_14px_rgba(212,175,55,0.2)]'
                  : isVisited
                  ? 'opacity-50 cursor-default'
                  : 'opacity-20 cursor-not-allowed'
                }`}
              style2={{
                width: sz, height: sz,
                left: `${node.x}%`, bottom: `${node.y}%`,
              }}
              aria-label={`${node.type} csomópont`}
            >
              {/* Node circle */}
              <div
                className="rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  width: sz,
                  height: sz,
                  background: isCurrent
                    ? `radial-gradient(circle, ${meta.color}, ${meta.color}88)`
                    : isActive
                    ? `radial-gradient(circle, ${meta.color}33, #1a0f0f)`
                    : isVisited
                    ? '#1a0f0f'
                    : '#0a0606',
                  borderColor: isCurrent
                    ? meta.color
                    : isActive
                    ? `${meta.color}88`
                    : '#2b1717',
                  color: isCurrent ? '#1a0800' : isActive ? meta.color : '#522d2d',
                  boxShadow: isCurrent ? `0 0 20px ${meta.color}66` : undefined,
                }}
              >
                {getIcon(node.type, sz)}
              </div>

              {/* Type label */}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-wider font-bold"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </motion.span>
              )}

              {/* Current position pulse */}
              {isCurrent && (
                <motion.div
                  className="absolute rounded-full border-2 pointer-events-none"
                  style={{ borderColor: meta.color, inset: -6 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

export default MapComponent;

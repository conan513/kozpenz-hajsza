import React from 'react';
import { motion } from 'motion/react';
import { Card, GameState } from '../types';
import { Sword, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface CardProps {
  card: Card;
  gameState: GameState;
  onClick?: (card: Card) => void;
  disabled?: boolean;
}

// SVG card artwork per type
const CardArtwork: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'Attack':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <path d="M8 32 L30 10" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M28 10 L32 8 L30 12 Z" fill="#ef4444"/>
          <path d="M8 32 L10 34 L12 30 Z" fill="#7f1d1d"/>
          <circle cx="20" cy="21" r="3" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="0.8"/>
          {[0,1,2].map(i => (
            <path key={i} d={`M${20+Math.cos(i*2.1)*12} ${21+Math.sin(i*2.1)*12} L${20+Math.cos(i*2.1)*6} ${21+Math.sin(i*2.1)*6}`}
              stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5"/>
          ))}
          <path d="M15 15 L18 20 M22 20 L25 15 M20 25 L20 29" stroke="#f87171" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
        </svg>
      );
    case 'Skill':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <polygon points="20,6 24,16 35,16 26,23 29,34 20,28 11,34 14,23 5,16 16,16"
            fill="rgba(13,148,136,0.15)" stroke="#0d9488" strokeWidth="1.2"/>
          <circle cx="20" cy="20" r="6" fill="rgba(13,148,136,0.25)" stroke="#0d9488" strokeWidth="1"/>
          <circle cx="20" cy="20" r="2.5" fill="#0d9488"/>
          <path d="M20 11 L20 14 M20 26 L20 29 M11 20 L14 20 M26 20 L29 20"
            stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7"/>
        </svg>
      );
    case 'Power':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <path d="M20 5 L23 16 L34 16 L25 23 L28 34 L20 28 L12 34 L15 23 L6 16 L17 16 Z"
            fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1"/>
          <circle cx="20" cy="20" r="8" fill="rgba(126,34,206,0.3)" stroke="#a855f7" strokeWidth="1.5"/>
          {[0,60,120,180,240,300].map((deg, i) => (
            <circle key={i} cx={20+7*Math.cos(deg*Math.PI/180)} cy={20+7*Math.sin(deg*Math.PI/180)}
              r="1.2" fill="#c084fc" opacity="0.7"/>
          ))}
          <circle cx="20" cy="20" r="3" fill="#a855f7"/>
        </svg>
      );
    case 'Hex':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <path d="M20 6 Q22 10 20 14 Q18 10 20 6Z" fill="#ef4444" opacity="0.6"/>
          <circle cx="20" cy="20" r="10" fill="rgba(30,10,10,0.6)" stroke="#7f1d1d" strokeWidth="1.5" strokeDasharray="3 2"/>
          <text x="20" y="24" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold" opacity="0.8">✕</text>
          <path d="M12 28 Q16 24 20 28 Q24 32 28 28" stroke="#ef4444" strokeWidth="1" fill="none" opacity="0.5"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <circle cx="20" cy="20" r="12" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4 3"/>
          <circle cx="20" cy="20" r="4" fill="#4b5563"/>
        </svg>
      );
  }
};

const CardComponent: React.FC<CardProps> = React.memo(({ card, gameState, onClick, disabled }) => {
  const getDynamicDescription = () => {
    if (!gameState.player || gameState.view !== 'Combat') return card.description;
    const strength = gameState.player.statusEffects.find(s => s.type === 'Strength')?.stacks || 0;
    const dexterity = gameState.player.statusEffects.find(s => s.type === 'Dexterity')?.stacks || 0;
    const isWeak = gameState.player.statusEffects.some(s => s.type === 'Weak');
    let desc = card.description;
    desc = desc.replace(/(\d+)(\s+sebzést)/g, (_, val, suffix) => {
      let n = parseInt(val) + strength;
      if (isWeak) n = Math.floor(n * 0.75);
      const color = n > parseInt(val) ? 'text-green-400' : n < parseInt(val) ? 'text-red-400' : '';
      return `<span class="${color} font-bold">${n}</span>${suffix}`;
    });
    desc = desc.replace(/(\d+)(\s+(Cenzúrát|Blokkot))/g, (_, val, suffix) => {
      const n = parseInt(val) + dexterity;
      const color = n > parseInt(val) ? 'text-green-400' : n < parseInt(val) ? 'text-red-400' : '';
      return `<span class="${color} font-bold">${n}</span>${suffix}`;
    });
    return desc;
  };

  const getCardStyle = () => {
    if (card.characterClass === 'Colorless') return 'border-gray-400/70 bg-gradient-to-br from-gray-700 to-gray-800';
    switch (card.type) {
      case 'Attack': return 'border-[#8B0000]/80 bg-gradient-to-br from-[#200808] via-[#3a0c0c] to-[#4A0E0E]';
      case 'Skill':  return 'border-[#0d9488]/80 bg-gradient-to-br from-[#071e1e] via-[#102828] to-[#164040]';
      case 'Power':  return 'border-purple-600/80 bg-gradient-to-br from-[#1a0a2e] via-[#2d1460] to-[#4C1D95]';
      case 'Hex':    return 'border-red-900/70 bg-gradient-to-br from-[#0d0404] via-[#1a0808] to-[#1f0a0a]';
      default:       return 'border-bento-border bg-bento-panel';
    }
  };

  const getRarityClass = () => {
    if (card.rarity === 'Rare')     return 'ring-2 ring-bento-gold/80 drop-shadow-[0_0_14px_rgba(212,175,55,0.6)] card-rare-shimmer';
    if (card.rarity === 'Uncommon') return 'ring-1 ring-gray-300/60 drop-shadow-[0_0_8px_rgba(200,200,200,0.4)] card-uncommon-shimmer';
    return '';
  };

  const getIcon = () => {
    switch (card.type) {
      case 'Attack': return <Sword size={16} className="text-red-400" />;
      case 'Skill':  return <Shield size={16} className="text-teal-400" />;
      case 'Power':  return <Sparkles size={16} className="text-purple-300" />;
      case 'Hex':    return <AlertCircle size={16} className="text-red-700" />;
    }
  };

  const typeLabel = () => {
    switch (card.type) {
      case 'Attack': return 'Támadás';
      case 'Skill':  return 'Törvény';
      case 'Power':  return 'Rendelet';
      case 'Hex':    return 'Átok';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.35, y: disabled ? 0 : -30, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onClick={disabled ? undefined : () => onClick?.(card)}
      className={`relative w-28 h-40 md:w-32 md:h-44 rounded-sm border-2 p-1.5 md:p-2 lux-shadow cursor-pointer select-none overflow-hidden
        ${getCardStyle()} ${getRarityClass()}
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed shadow-none' : 'opacity-100'}
      `}
    >
      {/* Paper texture */}
      <div className="absolute inset-0 paper-texture opacity-50" />

      {/* Hex watermark */}
      {card.type === 'Hex' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className="text-red-800/30 font-black text-4xl -rotate-45 tracking-widest border-4 border-red-800/20 px-2 rounded-sm">TITKOS</span>
        </div>
      )}

      {/* Header: cost + name */}
      <div className="relative z-10 flex items-start gap-1.5 mb-1 min-h-[28px]">
        <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 rounded-full flex items-center justify-center font-black font-serif text-xs md:text-sm border shadow-sm"
          style={{ background: 'radial-gradient(circle, #e8c84a, #b8960a)', borderColor: 'rgba(0,0,0,0.5)', color: '#1a0800' }}>
          {card.cost < 0 ? 'X' : card.cost}
        </div>
        <span className="text-bento-text-main font-serif font-bold text-[9px] md:text-[10px] uppercase leading-tight line-clamp-2 break-words pt-0.5 md:pt-1 drop-shadow-md">
          {card.name}
        </span>
      </div>

      {/* Art area */}
      <div className="relative z-10 h-14 rounded-sm mb-1.5 flex items-center justify-center border border-white/10 shadow-inner overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="w-10 h-10 opacity-80 drop-shadow-lg">
          <CardArtwork type={card.type} />
        </div>
        {/* Type icon overlay */}
        <div className="absolute bottom-1 left-1.5 opacity-50">{getIcon()}</div>
      </div>

      {/* Description */}
      <div className="relative z-10 bg-black/55 rounded-sm p-1.5 h-[52px] flex flex-col justify-center border-t border-white/5">
        <div className="text-bento-text-dim font-mono text-[8px] md:text-[9px] leading-snug text-center"
          dangerouslySetInnerHTML={{ __html: getDynamicDescription() }} />
      </div>

      {/* Footer: type label */}
      <div className="absolute bottom-1 right-2 z-10">
        <span className="text-[6px] md:text-[7px] uppercase tracking-widest text-bento-gold/60 font-serif font-bold italic">
          {typeLabel()}
        </span>
      </div>

      {/* Retain badge */}
      {card.retain && (
        <div className="absolute top-1 right-1 z-20 bg-yellow-600/80 text-[6px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm text-white">
          Retain
        </div>
      )}
      {/* Exhaust badge */}
      {card.exhaust && (
        <div className="absolute top-1 right-1 z-20 bg-purple-800/80 text-[6px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm text-white"
          style={{ top: card.retain ? '14px' : '4px' }}>
          Exhaust
        </div>
      )}
    </motion.div>
  );
});

export default CardComponent;
